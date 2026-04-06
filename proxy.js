import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  AUTH_PAGE_PATH,
  buildAuthRedirectUrl,
  getSafeRedirectPath,
  isProtectedApiPath,
  isProtectedPagePath,
} from "./lib/auth-routes";
import {
  getSupabaseAuthServerConfig,
  SUPABASE_AUTH_CONFIG_MESSAGE,
} from "./lib/supabase-auth-config";

function copyCookies(sourceResponse, targetResponse) {
  sourceResponse.cookies.getAll().forEach((cookie) => {
    targetResponse.cookies.set(cookie);
  });

  return targetResponse;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === AUTH_PAGE_PATH;
  const isProtectedPage = isProtectedPagePath(pathname);
  const isProtectedApi = isProtectedApiPath(pathname);

  if (!isAuthPage && !isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const { url, key } = getSupabaseAuthServerConfig();

  if (!url || !key) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: SUPABASE_AUTH_CONFIG_MESSAGE },
        { status: 503 },
      );
    }

    if (isProtectedPage) {
      const redirectUrl = buildAuthRedirectUrl(request.nextUrl);
      redirectUrl.searchParams.set("error", "config");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedApi) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!user && isProtectedPage) {
    const redirectResponse = NextResponse.redirect(buildAuthRedirectUrl(request.nextUrl));
    return copyCookies(response, redirectResponse);
  }

  if (user && isAuthPage) {
    const redirectUrl = new URL(
      getSafeRedirectPath(request.nextUrl.searchParams.get("redirectTo")),
      request.url,
    );
    const redirectResponse = NextResponse.redirect(redirectUrl);
    return copyCookies(response, redirectResponse);
  }

  return response;
}

export const config = {
  matcher: [
    "/auth",
    "/dashboard/:path*",
    "/chat/:path*",
    "/contest/:path*",
    "/api/dashboard/:path*",
    "/api/ask/:path*",
    "/api/contest/:path*",
  ],
};
