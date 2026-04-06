import "server-only";

function parseOriginList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAllowedOrigins() {
  return [
    ...parseOriginList(process.env.ALLOWED_FRONTEND_ORIGINS),
    ...parseOriginList(process.env.CORS_ALLOWED_ORIGIN),
    ...parseOriginList(process.env.CORS_ALLOWED_ORIGINS),
  ];
}

function getAllowedOrigin(request) {
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.length === 0) {
    return "";
  }

  if (allowedOrigins.includes("*")) {
    return "*";
  }

  const requestOrigin = request?.headers?.get("origin")?.trim() || "";

  if (!requestOrigin) {
    return "";
  }

  return allowedOrigins.includes(requestOrigin) ? requestOrigin : "";
}

function buildCorsHeaders(request) {
  const origin = getAllowedOrigin(request);

  if (!origin) {
    return {};
  }

  const requestedHeaders =
    request?.headers?.get("access-control-request-headers")?.trim() ||
    "Content-Type, Authorization";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": requestedHeaders,
    Vary: "Origin",
  };
}

export function jsonResponse(request, body, init = {}) {
  const { headers, ...rest } = init;

  return Response.json(body, {
    ...rest,
    headers: {
      "Cache-Control": "no-store",
      ...buildCorsHeaders(request),
      ...(headers || {}),
    },
  });
}

export function optionsResponse(request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      ...buildCorsHeaders(request),
    },
  });
}
