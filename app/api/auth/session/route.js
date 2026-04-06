import { jsonResponse, optionsResponse } from "../../../../lib/api-response";
import { getAuthenticatedUser } from "../../../../lib/supabase-server";
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

export async function GET(request) {
  if (!isSupabaseAuthConfigured()) {
    return jsonResponse(
      request,
      {
        authenticated: false,
        user: null,
        error: SUPABASE_AUTH_CONFIG_MESSAGE,
      },
      { status: 503 },
    );
  }

  const user = await getAuthenticatedUser();

  return jsonResponse(request, {
    authenticated: Boolean(user),
    user: buildUserPayload(user),
  });
}

export async function OPTIONS(request) {
  return optionsResponse(request);
}
