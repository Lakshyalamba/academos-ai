import { jsonResponse, optionsResponse } from "../../../lib/api-response";
import { isGeminiConfigured } from "../../../lib/gemini";
import { isSupabaseConfigured } from "../../../lib/supabase";

export const runtime = "nodejs";

export async function GET(request) {
  return jsonResponse(
    request,
    {
      status: "ok",
      service: "academos-backend",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks: {
        geminiConfigured: isGeminiConfigured(),
        supabaseConfigured: isSupabaseConfigured(),
      },
    },
    { status: 200 },
  );
}

export async function OPTIONS(request) {
  return optionsResponse(request);
}
