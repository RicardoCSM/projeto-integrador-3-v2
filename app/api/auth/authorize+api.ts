import {
  GOOGLE_CLIENT_ID,
  BASE_URL,
  APP_SCHEME,
  GOOGLE_AUTH_URL,
} from "~/lib/constants";

/**
 * @description Essa rota é responsável por redirecionar o usuário para a página de autorização do Google.
 * @param request - A requisição HTTP que contém os parâmetros necessários para a autorização.
 * @returns Um redirecionamento para a URL de autorização do Google com os parâmetros necessários.
 * @throws Retorna um erro 500 se a variável de ambiente GOOGLE_CLIENT_ID não estiver definida.
 * @throws Retorna um erro 400  em caso de parâmetros inválidos, como `redirect_uri` ou `client_id`.
 */
export async function GET(request: Request) {
  if (!GOOGLE_CLIENT_ID) {
    return Response.json(
      { error: "Missing GOOGLE_CLIENT_ID environment variable" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  let idpClientId: string;

  const internalClient = url.searchParams.get("client_id");

  const redirectUri = url.searchParams.get("redirect_uri");

  let platform;

  if (redirectUri === APP_SCHEME) {
    platform = "mobile";
  } else if (redirectUri === BASE_URL) {
    platform = "web";
  } else {
    return Response.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }

  let state = platform + "|" + url.searchParams.get("state");

  if (internalClient === "google") {
    idpClientId = GOOGLE_CLIENT_ID;
  } else {
    return Response.json({ error: "Invalid client" }, { status: 400 });
  }

  if (!state) {
    return Response.json({ error: "Invalid state" }, { status: 400 });
  }

  const params = new URLSearchParams({
    client_id: idpClientId,
    redirect_uri: BASE_URL + "/api/auth/callback",
    response_type: "code",
    scope: url.searchParams.get("scope") || "identity",
    state: state,
    access_type: "offline",
    prompt: "consent",
  });

  return Response.redirect(GOOGLE_AUTH_URL + "?" + params.toString());
}
