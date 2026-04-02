import { isValidContestDraft } from "../../../../lib/contest-draft";
import { generateContestGuidance } from "../../../../lib/contest-guidance";
import { getRuntimeStatus } from "../../../../lib/runtime-status";

export const runtime = "nodejs";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const contest = body?.contest;

  if (!isValidContestDraft(contest)) {
    return Response.json(
      { error: "Request body must include a valid saved contest object." },
      { status: 400 },
    );
  }

  const runtimeStatus = getRuntimeStatus();

  if (runtimeStatus.status !== "ok") {
    return Response.json(
      {
        error: runtimeStatus.message,
        status: runtimeStatus.status,
        config: runtimeStatus.config,
        missing: runtimeStatus.missing,
      },
      { status: 503 },
    );
  }

  try {
    const guidance = await generateContestGuidance(contest);
    return Response.json(guidance);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate contest prep guidance.";

    return Response.json({ error: message }, { status: 500 });
  }
}
