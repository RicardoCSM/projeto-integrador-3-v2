import * as jose from "jose";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  COOKIE_MAX_AGE,
  JWT_EXPIRATION_TIME,
  JWT_SECRET,
  COOKIE_OPTIONS,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_COOKIE_OPTIONS,
} from "~/lib/constants";

/**
 * @description Essa rota é responsável por trocar o código de autorização do Google por um token de acesso e um token de atualização.
 * Ela recebe o código de autorização, valida-o e gera os tokens JWT necessários para autenticação do usuário.
 * @param request - A requisição HTTP que contém o código de autorização e outros parâmetros necessários.
 * @returns Um objeto JSON com o token de acesso e o token de atualização, ou um erro se a validação falhar.
 * @throws Retorna um erro 400 se o código de autorização estiver ausente ou inválido.
 * @throws Retorna um erro 500 se ocorrer um erro no servidor durante o processo de troca de tokens.
 * @throws Retorna um erro 401 se o token de acesso ou o token de atualização não puderem ser gerados corretamente.
 * @throws Retorna um erro 400 se houver um erro de validação do OAuth, como parâmetros ausentes ou inválidos.
 */
export async function POST(request: Request) {
  const body = await request.formData();
  const code = body.get("code") as string;
  const platform = (body.get("platform") as string) || "native";

  if (!code) {
    return Response.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
      code: code,
    }),
  });

  const data = await response.json();

  if (!data.id_token || !data.access_token) {
    return Response.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const userInfo = jose.decodeJwt(data.id_token) as any;

  const sub = userInfo.sub;
  const issuedAt = Math.floor(Date.now() / 1000);
  const jti = crypto.randomUUID();

  const payloadBase = {
    ...userInfo,
    google_access_token: data.access_token,
    google_refresh_token: data.refresh_token,
  };

  delete payloadBase.exp;

  const accessToken = await new jose.SignJWT(payloadBase)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .setSubject(sub)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  const refreshToken = await new jose.SignJWT({
    sub,
    jti,
    type: "refresh",
    name: (userInfo as any).name,
    email: (userInfo as any).email,
    picture: (userInfo as any).picture,
    given_name: (userInfo as any).given_name,
    family_name: (userInfo as any).family_name,
    email_verified: (userInfo as any).email_verified,
    google_access_token: data.access_token,
    google_refresh_token: data.refresh_token,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  if (data.error) {
    return Response.json(
      {
        error: data.error,
        error_description: data.error_description,
        message:
          "OAuth validation error - please ensure the app complies with Google's OAuth 2.0 policy",
      },
      {
        status: 400,
      }
    );
  }

  if (platform === "web") {
    const response = Response.json({
      success: true,
      issuedAt: issuedAt,
      expiresAt: issuedAt + COOKIE_MAX_AGE,
    });

    response.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${accessToken}; Max-Age=${COOKIE_OPTIONS.maxAge}; Path=${
        COOKIE_OPTIONS.path
      }; ${COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""} ${
        COOKIE_OPTIONS.secure ? "Secure;" : ""
      } SameSite=${COOKIE_OPTIONS.sameSite}`
    );

    response.headers.append(
      "Set-Cookie",
      `${REFRESH_COOKIE_NAME}=${refreshToken}; Max-Age=${
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
    accessToken,
    refreshToken,
  });
}
