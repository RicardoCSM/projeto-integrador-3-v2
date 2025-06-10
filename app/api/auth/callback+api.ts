import { BASE_URL, APP_SCHEME } from "~/lib/constants";

/**
 * @description Essa rota é responsável por redirecionar o usuário de volta para o aplicativo ou site após a autorização.
 * @param request - A requisição HTTP que contém os parâmetros necessários para o redirecionamento.
 * @returns Um redirecionamento para a URL apropriada com os parâmetros necessários.
 * @throws Retorna um erro 400 se o parâmetro `state` estiver ausente ou inválido.
 */
export async function GET(request: Request) {
  const incomingParams = new URLSearchParams(request.url.split("?")[1]);
  const combinedPlatformAndState = incomingParams.get("state");
  if (!combinedPlatformAndState) {
    return Response.json({ error: "Invalid state" }, { status: 400 });
  }
  const platform = combinedPlatformAndState.split("|")[0];
  const state = combinedPlatformAndState.split("|")[1];

  const outgoingParams = new URLSearchParams({
    code: incomingParams.get("code")?.toString() || "",
    state,
  });

  return Response.redirect(
    (platform === "web" ? BASE_URL : APP_SCHEME) +
      "?" +
      outgoingParams.toString()
  );
}
