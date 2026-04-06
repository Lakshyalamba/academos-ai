import "server-only";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function serializeError(error) {
  if (!(error instanceof Error)) {
    return { message: String(error) };
  }

  const serialized = {
    name: error.name,
    message: error.message,
  };

  if (!isProduction() && error.stack) {
    serialized.stack = error.stack;
  }

  return serialized;
}

export function logServerError(message, error, metadata = {}) {
  console.error(message, {
    ...metadata,
    error: serializeError(error),
  });
}
