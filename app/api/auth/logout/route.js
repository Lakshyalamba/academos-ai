import { jsonResponse, optionsResponse } from "../../../../lib/api-response";
import { createSupabaseRouteHandlerClient } from "../../../../lib/supabase-server";
import {
  isSupabaseAuthConfigured,
  SUPABASE_AUTH_CONFIG_MESSAGE,
} from "../../../../lib/supabase-auth-config";

export const runtime = "nodejs";

export async function POST(request) {
  if (!isSupabaseAuthConfigured()) {
    return jsonResponse(request, { error: SUPABASE_AUTH_CONFIG_MESSAGE }, { status: 503 });
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return jsonResponse(request, { error: error.message }, { status: 400 });
  }

  return jsonResponse(request, { ok: true });
}

export async function OPTIONS(request) {
  return optionsResponse(request);
}
