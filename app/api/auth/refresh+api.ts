import * as jose from "jose";
import {
  COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  COOKIE_MAX_AGE,
  JWT_EXPIRATION_TIME,
  JWT_SECRET,
  COOKIE_OPTIONS,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_COOKIE_OPTIONS,
} from "@/utils/constants";

export async function POST(request: Request) {
  try {
    let platform = "native";
    let refreshToken: string | null = null;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        const jsonBody = await request.json();
        platform = jsonBody.platform || "native";

        if (platform === "native" && jsonBody.refreshToken) {
          refreshToken = jsonBody.refreshToken;
        }
      } catch (e) {
        console.log("Failed to parse JSON body, using default platform");
      }
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      try {
        const formData = await request.formData();
        platform = (formData.get("platform") as string) || "native";

        if (platform === "native" && formData.get("refreshToken")) {
          refreshToken = formData.get("refreshToken") as string;
        }
      } catch (e) {
        console.log("Failed to parse form data, using default platform");
      }
    } else {
      try {
        const url = new URL(request.url);
        platform = url.searchParams.get("platform") || "native";
      } catch (e) {
        console.log("Failed to parse URL parameters, using default platform");
      }
    }

    if (platform === "web" && !refreshToken) {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          acc[key.trim()] = value;
          return acc;
        }, {} as Record<string, string>);

        refreshToken = cookies[REFRESH_COOKIE_NAME];
      }
    }

    if (!refreshToken) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const accessToken = authHeader.split(" ")[1];

        try {
          const decoded = await jose.jwtVerify(
            accessToken,
            new TextEncoder().encode(JWT_SECRET)
          );

          console.log("No refresh token found, using access token as fallback");

          const userInfo = decoded.payload;

          const issuedAt = Math.floor(Date.now() / 1000);

          const newAccessToken = await new jose.SignJWT({ ...userInfo })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime(JWT_EXPIRATION_TIME)
            .setSubject(userInfo.sub as string)
            .setIssuedAt(issuedAt)
            .sign(new TextEncoder().encode(JWT_SECRET));

          if (platform === "web") {
            const response = Response.json({
              success: true,
              issuedAt: issuedAt,
              expiresAt: issuedAt + COOKIE_MAX_AGE,
              warning: "Using access token fallback - refresh token missing",
            });

            response.headers.set(
              "Set-Cookie",
              `${COOKIE_NAME}=${newAccessToken}; Max-Age=${
                COOKIE_OPTIONS.maxAge
              }; Path=${COOKIE_OPTIONS.path}; ${
                COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""
              } ${COOKIE_OPTIONS.secure ? "Secure;" : ""} SameSite=${
                COOKIE_OPTIONS.sameSite
              }`
            );

            return response;
          }

          return Response.json({
            accessToken: newAccessToken,
            warning: "Using access token fallback - refresh token missing",
          });
        } catch (error) {
          return Response.json(
            { error: "Authentication required - no valid refresh token" },
            { status: 401 }
          );
        }
      }

      return Response.json(
        { error: "Authentication required - no refresh token" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = await jose.jwtVerify(
        refreshToken,
        new TextEncoder().encode(JWT_SECRET)
      );
    } catch (error) {
      if (error instanceof jose.errors.JWTExpired) {
        return Response.json(
          { error: "Refresh token expired, please sign in again" },
          { status: 401 }
        );
      } else {
        return Response.json(
          { error: "Invalid refresh token, please sign in again" },
          { status: 401 }
        );
      }
    }

    const payload = decoded.payload;
    if (payload.type !== "refresh") {
      return Response.json(
        { error: "Invalid token type, please sign in again" },
        { status: 401 }
      );
    }

    const sub = payload.sub;
    if (!sub) {
      return Response.json(
        { error: "Invalid token, missing subject" },
        { status: 401 }
      );
    }

    const issuedAt = Math.floor(Date.now() / 1000);

    const jti = crypto.randomUUID();

    const userInfo = decoded.payload;

    const hasRequiredUserInfo =
      userInfo.name && userInfo.email && userInfo.picture;

    let completeUserInfo = { ...userInfo };

    if (!hasRequiredUserInfo) {
      completeUserInfo = {
        ...userInfo,
        type: "refresh",
        name: userInfo.name || `user`,
        email: userInfo.email || `user`,
        picture:
          userInfo.picture ||
          `https://ui-avatars.com/api/?name=User&background=random`,
      };
    }

    const newAccessToken = await new jose.SignJWT({
      ...completeUserInfo,
      type: undefined,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRATION_TIME)
      .setSubject(sub)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    const newRefreshToken = await new jose.SignJWT({
      ...completeUserInfo,
      jti,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    if (platform === "web") {
      const response = Response.json({
        success: true,
        issuedAt: issuedAt,
        expiresAt: issuedAt + COOKIE_MAX_AGE,
      });

      response.headers.set(
        "Set-Cookie",
        `${COOKIE_NAME}=${newAccessToken}; Max-Age=${
          COOKIE_OPTIONS.maxAge
        }; Path=${COOKIE_OPTIONS.path}; ${
          COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""
        } ${COOKIE_OPTIONS.secure ? "Secure;" : ""} SameSite=${
          COOKIE_OPTIONS.sameSite
        }`
      );

      response.headers.append(
        "Set-Cookie",
        `${REFRESH_COOKIE_NAME}=${newRefreshToken}; Max-Age=${
          REFRESH_COOKIE_OPTIONS.maxAge
        }; Path=${REFRESH_COOKIE_OPTIONS.path}; ${
          REFRESH_COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""
        } ${REFRESH_COOKIE_OPTIONS.secure ? "Secure;" : ""} SameSite=${
          REFRESH_COOKIE_OPTIONS.sameSite
        }`
      );

      return response;
    }

    return Response.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return Response.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}
