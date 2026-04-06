import "server-only";

const DEFAULT_SNAPSHOTS_TABLE = "academic_snapshots";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table =
    process.env.SUPABASE_ACADEMIC_SNAPSHOTS_TABLE || DEFAULT_SNAPSHOTS_TABLE;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.",
    );
  }

  return {
    url: url.replace(/\/+$/, ""),
    serviceRoleKey,
    table,
  };
}

async function parseSupabaseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function supabaseRequest(path, { method = "GET", body, headers } = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    cache: "no-store",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...headers,
    },
    ...(typeof body === "undefined" ? {} : { body: JSON.stringify(body) }),
  });
  const data = await parseSupabaseResponse(response);

  if (!response.ok) {
    let message =
      data?.message ||
      data?.error_description ||
      data?.details ||
      (typeof data === "string" ? data : "Supabase request failed.");

    if (/academic_snapshots/i.test(message) && /does not exist|relation/i.test(message)) {
      message =
        "Supabase table setup is missing. Apply supabase/schema.sql before using this flow.";
    }

    throw new Error(message);
  }

  return data;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function insertAcademicSnapshot({
  query,
  intent,
  source,
  toolsUsed,
  snapshot,
}) {
  const { table } = getSupabaseConfig();
  const rows = await supabaseRequest(`${table}?select=*`, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: {
      query,
      intent,
      source,
      tools_used: toolsUsed,
      snapshot,
    },
  });

  if (!Array.isArray(rows) || !rows[0]) {
    throw new Error("Supabase did not return the inserted academic snapshot.");
  }

  return rows[0];
}

export async function getAcademicSnapshotById(id) {
  const { table } = getSupabaseConfig();
  const rows = await supabaseRequest(
    `${table}?id=eq.${encodeURIComponent(id)}&select=*`,
  );

  if (!Array.isArray(rows) || !rows[0]) {
    throw new Error("Stored academic snapshot was not found in Supabase.");
  }

  return rows[0];
}

export async function getLatestAcademicSnapshot() {
  const { table } = getSupabaseConfig();
  const rows = await supabaseRequest(
    `${table}?select=*&order=created_at.desc&limit=1`,
  );

  if (!Array.isArray(rows) || !rows[0]) {
    return null;
  }

  return rows[0];
}

export async function updateAcademicSnapshotReasoning(
  id,
  { reasoningResponse, reasoningModel },
) {
  const { table } = getSupabaseConfig();
  const rows = await supabaseRequest(
    `${table}?id=eq.${encodeURIComponent(id)}&select=*`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: {
        reasoning_response: reasoningResponse,
        reasoning_model: reasoningModel,
      },
    },
  );

  if (!Array.isArray(rows) || !rows[0]) {
    throw new Error("Supabase did not return the updated academic snapshot.");
  }

  return rows[0];
}
