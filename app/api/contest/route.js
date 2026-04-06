import { jsonResponse, optionsResponse } from "../../../lib/api-response";
import { getContestPageData } from "../../../lib/contest-history";

export const runtime = "nodejs";

export async function GET(request) {
  const contestPageData = await getContestPageData();

  return jsonResponse(request, contestPageData, {
    status: contestPageData.status.available ? 200 : 503,
  });
}

export async function OPTIONS(request) {
  return optionsResponse(request);
}
