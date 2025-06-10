import {
  COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "~/lib/constants";

/**
 * @description Essa rota é responsável por fazer o logout do usuário, removendo os cookies de autenticação.
 * @param request - A requisição HTTP que contém os parâmetros necessários para o logout.
 * @returns Uma resposta JSON indicando sucesso ou erro.
 * @throws Retorna um erro 500 se ocorrer um erro no servidor durante o processo de logout.
 * @throws Retorna um erro 400 se os cookies não puderem ser removidos corretamente.
 */
export async function POST(request: Request) {
  try {
    const response = Response.json({ success: true });

    response.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=; Max-Age=0; Path=${COOKIE_OPTIONS.path}; ${
        COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""
      } ${COOKIE_OPTIONS.secure ? "Secure;" : ""} SameSite=${
        COOKIE_OPTIONS.sameSite
      }`
    );

    response.headers.append(
      "Set-Cookie",
      `${REFRESH_COOKIE_NAME}=; Max-Age=0; Path=${
        REFRESH_COOKIE_OPTIONS.path
      }; ${REFRESH_COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""} ${
        REFRESH_COOKIE_OPTIONS.secure ? "Secure;" : ""
      } SameSite=${REFRESH_COOKIE_OPTIONS.sameSite}`
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
