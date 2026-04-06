import "server-only";

export const LIVE_SYNC_UNAVAILABLE_MESSAGE =
  "Live academic sync is unavailable in this deployment.";
export const FALLBACK_GUIDANCE_MESSAGE =
  "You can still explore the interface and use fallback guidance.";
export const LIVE_SYNC_DEMO_NOTICE =
  `${LIVE_SYNC_UNAVAILABLE_MESSAGE} ${FALLBACK_GUIDANCE_MESSAGE}`;

export function buildRuntimeMessage({
  liveAcademicSyncAvailable,
  llmConfigured,
  supabaseConfigured,
  demoModeForced,
}) {
  if (liveAcademicSyncAvailable && llmConfigured) {
    return supabaseConfigured
      ? "Academos is running with live Newton sync, Gemini reasoning, and Supabase persistence."
      : "Academos is running with live Newton sync and Gemini reasoning. Supabase persistence is optional and currently disabled.";
  }

  if (liveAcademicSyncAvailable) {
    return "Gemini reasoning is unavailable in this deployment. Live academic sync is still available, but answers fall back to limited non-live guidance only.";
  }

  if (llmConfigured) {
    return demoModeForced
      ? `Demo mode is forced for this deployment. ${FALLBACK_GUIDANCE_MESSAGE}`
      : LIVE_SYNC_DEMO_NOTICE;
  }

  return `${LIVE_SYNC_UNAVAILABLE_MESSAGE} AI reasoning is also unavailable, so responses fall back to basic non-live guidance only.`;
}

export function buildStaticAcademicFallbackResponse(
  query,
  { snapshotRecord = null } = {},
) {
  const normalizedQuery = String(query || "").trim();
  const lowerQuery = normalizedQuery.toLowerCase();
  const usesStoredContext = Boolean(snapshotRecord?.snapshot);
  const storedContextNote = usesStoredContext
    ? "This response uses previously stored academic context and may be outdated."
    : "This response uses general academic guidance only.";
  const tasks = [];
  const insights = [
    LIVE_SYNC_UNAVAILABLE_MESSAGE,
    storedContextNote,
  ];

  if (/contest|quiz|assessment|exam/.test(lowerQuery)) {
    tasks.push("List the exact topics you expect and split revision into two or three focused blocks.");
    tasks.push("Prioritize the weakest topic first, then do one timed practice set before the deadline.");
    insights.push("Fallback prep guidance is safest when it stays anchored to your own saved syllabus and notes.");
  } else if (/attendance|class|lecture/.test(lowerQuery)) {
    tasks.push("Check the next classes you already know about and mark the ones you cannot afford to miss.");
    tasks.push("Review the latest lecture notes or recordings before the next class.");
    insights.push("Attendance-related guidance is generic here because live subject records are unavailable.");
  } else if (/assignment|deadline|overdue|pending/.test(lowerQuery)) {
    tasks.push("List every pending task you already know, then sort it by deadline and effort.");
    tasks.push("Finish the shortest overdue or urgent item first to reduce backlog pressure.");
    insights.push("Deadline guidance is non-live here, so confirm exact due dates from your academic portal.");
  } else {
    tasks.push("Write down your top three academic priorities for this week.");
    tasks.push("Start with the most time-sensitive or weakest area before moving to revision.");
    insights.push("General fallback guidance is intentionally conservative when verified records are unavailable.");
  }

  return {
    summary: usesStoredContext
      ? "Live Newton academic data is unavailable in this deployment, so this answer is based on previously stored context and general reasoning only."
      : "Live Newton academic data is unavailable in this deployment, so this answer is based on general reasoning only.",
    tasks: tasks.slice(0, 4),
    insights: [...new Set(insights)].slice(0, 4),
    source: usesStoredContext ? "demo-stored-fallback" : "demo-static",
    mode: "demo",
    notice: LIVE_SYNC_DEMO_NOTICE,
    snapshotId: typeof snapshotRecord?.id === "string" ? snapshotRecord.id : "",
  };
}
