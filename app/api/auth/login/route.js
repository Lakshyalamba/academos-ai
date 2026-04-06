import { jsonResponse, optionsResponse } from "../../../../lib/api-response";
import { createSupabaseRouteHandlerClient } from "../../../../lib/supabase-server";
import {
  isSupabaseAuthConfigured,
  SUPABASE_AUTH_CONFIG_MESSAGE,
} from "../../../../lib/supabase-auth-config";

export const runtime = "nodejs";

function buildUserPayload(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || "",
    fullName:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : "",
  };
}

export async function POST(request) {
  if (!isSupabaseAuthConfigured()) {
    return jsonResponse(request, { error: SUPABASE_AUTH_CONFIG_MESSAGE }, { status: 503 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "Request body must be valid JSON." }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return jsonResponse(
      request,
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const {
    data: { user, session },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return jsonResponse(request, { error: error.message }, { status: 401 });
  }

  return jsonResponse(request, {
    authenticated: Boolean(session && user),
    user: buildUserPayload(user),
  });
}

export async function OPTIONS(request) {
  return optionsResponse(request);
}
