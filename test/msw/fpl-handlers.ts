import { http, HttpResponse, type JsonBodyType } from "msw";

export function picksHandler(
  responder: (teamId: string, gameweek: string) => JsonBodyType
) {
  return http.get(
    "https://fantasy.premierleague.com/api/entry/:teamId/event/:gameweek/picks/",
    ({ params }) =>
      HttpResponse.json(
        responder(params.teamId as string, params.gameweek as string)
      )
  );
}

export function transfersHandler(
  responder: (teamId: string) => JsonBodyType
) {
  return http.get(
    "https://fantasy.premierleague.com/api/entry/:teamId/transfers/",
    ({ params }) => HttpResponse.json(responder(params.teamId as string))
  );
}

export function bootstrapStaticHandler(responder: () => JsonBodyType) {
  return http.get(
    "https://fantasy.premierleague.com/api/bootstrap-static/",
    () => HttpResponse.json(responder())
  );
}

export function fixturesHandler(responder: () => JsonBodyType) {
  return http.get("https://fantasy.premierleague.com/api/fixtures", () =>
    HttpResponse.json(responder())
  );
}

export function elementSummaryHandler(
  responder: (playerId: string) => JsonBodyType
) {
  return http.get(
    "https://fantasy.premierleague.com/api/element-summary/:playerId/",
    ({ params }) => HttpResponse.json(responder(params.playerId as string))
  );
}

export const notFoundPicksResponse = { detail: "Not found." };
