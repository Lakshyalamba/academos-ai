import { jsonResponse, optionsResponse } from "../../../../lib/api-response";
import { isValidContestDraft } from "../../../../lib/contest-draft";
import { generateContestGuidance } from "../../../../lib/contest-guidance";
import { getRuntimeStatus } from "../../../../lib/runtime-status";

export const runtime = "nodejs";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "Request body must be valid JSON." }, { status: 400 });
  }

  const contest = body?.contest;

  if (!isValidContestDraft(contest)) {
    return jsonResponse(
      request,
      { error: "Request body must include a valid saved contest object." },
      { status: 400 },
    );
  }

  const runtimeStatus = getRuntimeStatus();

  try {
    const guidance = await generateContestGuidance(contest, {
      useLiveAcademicContext: Boolean(runtimeStatus?.config?.liveAcademicSyncAvailable),
    });
    return jsonResponse(request, guidance);
  } catch (error) {
    return jsonResponse(
      request,
      {
        error: "Unable to generate contest prep guidance right now.",
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request) {
  return optionsResponse(request);
}
