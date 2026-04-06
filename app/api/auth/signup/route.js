import { jsonResponse, optionsResponse } from "../../../../lib/api-response";
import {
  createSupabaseAdminClient,
  createSupabaseRouteHandlerClient,
} from "../../../../lib/supabase-server";
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

  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!fullName || !email || !password) {
    return jsonResponse(
      request,
      { error: "Full name, email, and password are required." },
      { status: 400 },
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error) {
    return jsonResponse(request, { error: error.message }, { status: 400 });
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const {
    data: { session },
    error: signInError,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return jsonResponse(
      request,
      { error: signInError.message || "Account created but automatic login failed." },
      { status: 500 },
    );
  }

  return jsonResponse(request, {
    authenticated: Boolean(session && user),
    requiresEmailVerification: false,
    user: buildUserPayload(user),
  });
}

export async function OPTIONS(request) {
  return optionsResponse(request);
}
