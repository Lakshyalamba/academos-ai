export const SUPABASE_AUTH_CONFIG_MESSAGE =
  "Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.";

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function getSupabaseAuthPublicConfig() {
  return {
    url: normalizeString(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL).replace(
      /\/+$/,
      "",
    ),
    anonKey: normalizeString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

export function getSupabaseAuthServerConfig() {
  return {
    url: normalizeString(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL).replace(
      /\/+$/,
      "",
    ),
    key: normalizeString(
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function isSupabaseAuthConfigured() {
  const { url, key } = getSupabaseAuthServerConfig();
  return Boolean(url && key);
}
