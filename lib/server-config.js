import "server-only";

const DEFAULT_CODEX_COMMAND = "codex";
const DEFAULT_NEWTON_NPX_COMMAND = "npx";
const DEFAULT_NEWTON_CODEX_SERVER_NAME = "newton";
const DEFAULT_NEWTON_MCP_PACKAGE = "@newtonschool/newton-mcp@latest";
const DEFAULT_GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

function getEnvValue(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export const CODEX_COMMAND = getEnvValue("CODEX_COMMAND") || DEFAULT_CODEX_COMMAND;
export const NEWTON_NPX_COMMAND =
  getEnvValue("NEWTON_NPX_COMMAND") || DEFAULT_NEWTON_NPX_COMMAND;
export const NEWTON_CODEX_SERVER_NAME =
  getEnvValue("NEWTON_CODEX_SERVER_NAME") || DEFAULT_NEWTON_CODEX_SERVER_NAME;
export const NEWTON_MCP_PACKAGE =
  getEnvValue("NEWTON_MCP_PACKAGE") || DEFAULT_NEWTON_MCP_PACKAGE;
export const NEWTON_CODEX_SETUP_COMMAND =
  `${CODEX_COMMAND} mcp add ${NEWTON_CODEX_SERVER_NAME} -- ${NEWTON_NPX_COMMAND} -y ${NEWTON_MCP_PACKAGE}`;
export const NEWTON_LOGIN_COMMAND =
  `${NEWTON_NPX_COMMAND} -y ${NEWTON_MCP_PACKAGE} login`;
export const GEMINI_API_BASE_URL =
  getEnvValue("GEMINI_API_BASE_URL") || DEFAULT_GEMINI_API_BASE_URL;

export function getGeminiApiKey() {
  return getEnvValue("GEMINI_API_KEY") || getEnvValue("GOOGLE_API_KEY");
}

export function getConfiguredGeminiModel() {
  return (
    getEnvValue("GEMINI_MODEL") ||
    getEnvValue("GOOGLE_MODEL") ||
    DEFAULT_GEMINI_MODEL
  );
}
