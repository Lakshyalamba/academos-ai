import {
  askClaude,
  getConfiguredClaudeModel,
  isClaudeConfigured,
} from "../../../lib/claude";
import {
  buildStoredNewtonPrompt,
  getNewtonSnapshot,
} from "../../../lib/newton-mcp";
import {
  getAcademicSnapshotById,
  insertAcademicSnapshot,
  isSupabaseConfigured,
  updateAcademicSnapshotReasoning,
} from "../../../lib/supabase";

export const runtime = "nodejs";

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      return String(item).trim();
    })
    .filter(Boolean);
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  try {
    const rawQuery = body?.query;

    if (typeof rawQuery !== "string" || !rawQuery.trim()) {
      return Response.json(
        { error: "Request body must include a non-empty string 'query'." },
        { status: 400 },
      );
    }

    const query = rawQuery.trim();
    const hasClaudeApiKey = isClaudeConfigured();
    const hasSupabaseConfig = isSupabaseConfigured();

    if (!hasSupabaseConfig) {
      throw new Error(
        "Supabase storage is required. Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      );
    }

    if (!hasClaudeApiKey) {
      throw new Error(
        "Claude reasoning is required. Configure ANTHROPIC_API_KEY or CLAUDE_API_KEY.",
      );
    }

    const snapshot = await getNewtonSnapshot(query);
    const storedSnapshot = await insertAcademicSnapshot({
      query,
      intent: snapshot.intent,
      source: snapshot.source,
      toolsUsed: snapshot.toolsUsed,
      snapshot,
    });
    const persistedSnapshot = await getAcademicSnapshotById(storedSnapshot.id);
    const response = await askClaude(
      buildStoredNewtonPrompt(query, persistedSnapshot),
    );
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(response);
    } catch {
      throw new Error("Claude returned invalid JSON.");
    }

    if (!parsedResponse || typeof parsedResponse !== "object" || Array.isArray(parsedResponse)) {
      throw new Error("Claude returned an invalid JSON payload.");
    }

    if (typeof parsedResponse.error === "string" && parsedResponse.error.trim()) {
      await updateAcademicSnapshotReasoning(persistedSnapshot.id, {
        reasoningResponse: {
          error: parsedResponse.error.trim(),
        },
        reasoningModel: getConfiguredClaudeModel(),
      });

      return Response.json({ error: parsedResponse.error.trim() }, { status: 500 });
    }

    const normalizedResponse = {
      summary:
        typeof parsedResponse.summary === "string" ? parsedResponse.summary : "",
      tasks: normalizeList(parsedResponse.tasks),
      insights: normalizeList(parsedResponse.insights),
    };

    await updateAcademicSnapshotReasoning(persistedSnapshot.id, {
      reasoningResponse: normalizedResponse,
      reasoningModel: getConfiguredClaudeModel(),
    });

    return Response.json({
      ...normalizedResponse,
      source: "supabase-claude",
      snapshotId: persistedSnapshot.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process request.";

    return Response.json({ error: message }, { status: 500 });
  }
}
