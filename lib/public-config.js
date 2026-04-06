function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBaseUrl(value) {
  return normalizeString(value).replace(/\/+$/, "");
}

function normalizePath(path) {
  const value = normalizeString(path);

  if (!value) {
    return "/";
  }

  return value.startsWith("/") ? value : `/${value}`;
}

export function getApiUrl(path) {
  const normalizedPath = normalizePath(path);
  const apiBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (!apiBaseUrl) {
    return normalizedPath;
  }

  return `${apiBaseUrl}/${normalizedPath.replace(/^\/+/, "")}`;
}
