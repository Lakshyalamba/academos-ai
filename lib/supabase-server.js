import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabaseAuthServerConfig,
  SUPABASE_AUTH_CONFIG_MESSAGE,
} from "./supabase-auth-config";

async function createCookieStore() {
  return cookies();
}

export async function createSupabaseServerClient() {
  const { url, key } = getSupabaseAuthServerConfig();

  if (!url || !key) {
    throw new Error(SUPABASE_AUTH_CONFIG_MESSAGE);
  }

  const cookieStore = await createCookieStore();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
}

export async function createSupabaseRouteHandlerClient() {
  const { url, key } = getSupabaseAuthServerConfig();

  if (!url || !key) {
    throw new Error(SUPABASE_AUTH_CONFIG_MESSAGE);
  }

  const cookieStore = await createCookieStore();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });
}

export function createSupabaseAdminClient() {
  const { url, key } = getSupabaseAuthServerConfig();

  if (!url || !key) {
    throw new Error(SUPABASE_AUTH_CONFIG_MESSAGE);
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}
