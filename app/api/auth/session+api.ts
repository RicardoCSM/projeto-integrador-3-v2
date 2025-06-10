import * as jose from "jose";
import { COOKIE_NAME, JWT_SECRET } from "~/lib/constants";

/**
 * @description Essa rota é responsável por verificar a sessão do usuário.
 * Ela extrai o token de autenticação dos cookies, verifica sua validade e retorna as informações do usuário.
 * @param request - A requisição HTTP que contém os cookies necessários para a verificação da sessão.
 * @returns Um objeto JSON com as informações do usuário se a sessão for válida, ou um erro 401 se não estiver autenticado.
 * @throws Retorna um erro 500 se ocorrer um erro no servidor durante o processo de verificação da sessão.
 * @throws Retorna um erro 401 se o token de autenticação estiver ausente ou inválido.
 */
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const cookies: Record<string, Record<string, string>> = {};

    cookieHeader.split(";").forEach((cookie) => {
      const trimmedCookie = cookie.trim();

      if (trimmedCookie.includes("=")) {
        const [key, value] = trimmedCookie.split("=");
        const cookieName = key.trim();

        if (!cookies[cookieName]) {
          cookies[cookieName] = { value: value };
        } else {
          cookies[cookieName].value = value;
        }
      } else if (trimmedCookie.toLowerCase() === "httponly") {
        const lastCookieName = Object.keys(cookies).pop();
        if (lastCookieName) {
          cookies[lastCookieName].httpOnly = "true";
        }
      } else if (trimmedCookie.toLowerCase().startsWith("expires=")) {
        const lastCookieName = Object.keys(cookies).pop();
        if (lastCookieName) {
          cookies[lastCookieName].expires = trimmedCookie.substring(8);
        }
      } else if (trimmedCookie.toLowerCase().startsWith("max-age=")) {
        const lastCookieName = Object.keys(cookies).pop();
        if (lastCookieName) {
          cookies[lastCookieName].maxAge = trimmedCookie.substring(8);
        }
      }
    });

    if (!cookies[COOKIE_NAME] || !cookies[COOKIE_NAME].value) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = cookies[COOKIE_NAME].value;

    try {
      const verified = await jose.jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );

      let cookieExpiration: number | null = null;

      if (cookies[COOKIE_NAME].maxAge) {
        const maxAge = parseInt(cookies[COOKIE_NAME].maxAge, 10);
        const issuedAt =
          (verified.payload.iat as number) || Math.floor(Date.now() / 1000);
        cookieExpiration = issuedAt + maxAge;
      }

      return Response.json({
        ...verified.payload,
        cookieExpiration,
      });
    } catch (error) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Session error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
