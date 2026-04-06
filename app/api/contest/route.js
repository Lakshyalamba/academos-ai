import { jsonResponse, optionsResponse } from "../../../lib/api-response";
import { getContestPageData } from "../../../lib/contest-history";
import { getRuntimeStatus } from "../../../lib/runtime-status";

export const runtime = "nodejs";

export async function GET(request) {
  const runtimeStatus = getRuntimeStatus();
  const contestPageData = await getContestPageData({
    enabled: Boolean(runtimeStatus?.config?.liveAcademicSyncAvailable),
  });

  return jsonResponse(request, contestPageData, {
    status: 200,
  });
}

export async function OPTIONS(request) {
  return optionsResponse(request);
}
