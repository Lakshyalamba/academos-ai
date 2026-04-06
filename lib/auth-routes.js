export const AUTH_PAGE_PATH = "/auth";
export const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard";

const PROTECTED_PAGE_PREFIXES = ["/dashboard", "/chat", "/contest"];
const PROTECTED_API_PREFIXES = ["/api/dashboard", "/api/ask", "/api/contest"];

function matchesPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPagePath(pathname = "") {
  return PROTECTED_PAGE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function isProtectedApiPath(pathname = "") {
  return PROTECTED_API_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function getSafeRedirectPath(value, fallback = DEFAULT_AUTH_REDIRECT_PATH) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith("/") || trimmedValue.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(trimmedValue, "http://localhost");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function buildAuthRedirectUrl(requestUrl) {
  const authUrl = new URL(AUTH_PAGE_PATH, requestUrl.origin);
  authUrl.searchParams.set("mode", "login");
  authUrl.searchParams.set(
    "redirectTo",
    getSafeRedirectPath(`${requestUrl.pathname}${requestUrl.search}`),
  );

  return authUrl;
}
