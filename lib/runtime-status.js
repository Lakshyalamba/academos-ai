import "server-only";

import { spawnSync } from "node:child_process";
import {
  NEWTON_CODEX_SERVER_NAME,
  NEWTON_CODEX_SETUP_COMMAND,
  NEWTON_LOGIN_COMMAND,
} from "./newton-mcp";
import { isGeminiConfigured } from "./gemini";
import { CODEX_COMMAND } from "./server-config";
import { isSupabaseConfigured } from "./supabase";

const DEV_SERVER_COMMAND = "npm run dev";
const ENV_CONFIG_MESSAGE =
  "Set GEMINI_API_KEY or GOOGLE_API_KEY in your hosting platform or .env.local.";
const SUPABASE_CONFIG_MESSAGE =
  "Optional: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your hosting platform or .env.local to persist snapshots.";

function isNewtonMcpConfigured() {
  try {
    const result = spawnSync(
      CODEX_COMMAND,
      ["mcp", "get", NEWTON_CODEX_SERVER_NAME],
      {
        encoding: "utf8",
        timeout: 5000,
      },
    );

    if (result.error || result.status !== 0) {
      return false;
    }

    return /enabled:\s+true/i.test(result.stdout || "");
  } catch {
    return false;
  }
}

function buildMissingSteps({
  newtonConfigured,
  llmConfigured,
}) {
  const missing = [];

  if (!newtonConfigured) {
    missing.push(`Add Newton MCP to Codex: ${NEWTON_CODEX_SETUP_COMMAND}`);
  }

  if (!llmConfigured) {
    missing.push(ENV_CONFIG_MESSAGE);
  }

  if (missing.length > 0) {
    missing.push(`Restart the dev server: ${DEV_SERVER_COMMAND}`);
  }

  return missing;
}

export function getRuntimeStatus() {
  const newtonConfigured = isNewtonMcpConfigured();
  const llmConfigured = isGeminiConfigured();
  const supabaseConfigured = isSupabaseConfigured();
  const ready = newtonConfigured && llmConfigured;
  const missing = buildMissingSteps({
    newtonConfigured,
    llmConfigured,
  });
  const optional = [];

  if (!supabaseConfigured) {
    optional.push(SUPABASE_CONFIG_MESSAGE);
  }

  return {
    status: ready ? "ok" : "setup-required",
    message: ready
      ? supabaseConfigured
        ? "Academos is ready. Newton MCP is configured, Gemini reasoning is available, and Supabase persistence is enabled."
        : "Academos is ready. Newton MCP is configured and Gemini reasoning is available. Supabase persistence is optional and currently disabled."
      : "Local setup is incomplete. Finish the missing steps below before running academic reasoning.",
    config: {
      newtonConfigured,
      llmConfigured,
      geminiConfigured: llmConfigured,
      supabaseConfigured,
    },
    missing,
    optional,
    commands: {
      addNewton: NEWTON_CODEX_SETUP_COMMAND,
      loginNewton: NEWTON_LOGIN_COMMAND,
      restartDevServer: DEV_SERVER_COMMAND,
    },
    links: ["/dashboard", "/chat"],
  };
}
