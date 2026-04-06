import "server-only";

import { spawnSync } from "node:child_process";
import {
  NEWTON_CODEX_SERVER_NAME,
  NEWTON_CODEX_SETUP_COMMAND,
  NEWTON_LOGIN_COMMAND,
} from "./newton-mcp";
import {
  buildRuntimeMessage,
  FALLBACK_GUIDANCE_MESSAGE,
  LIVE_SYNC_UNAVAILABLE_MESSAGE,
} from "./demo-mode";
import { isGeminiConfigured } from "./gemini";
import { ACADEMOS_FORCE_DEMO_MODE, CODEX_COMMAND } from "./server-config";
import { isSupabaseConfigured } from "./supabase";

const DEV_SERVER_COMMAND = "npm run dev";
const ENV_CONFIG_MESSAGE =
  "Set GEMINI_API_KEY or GOOGLE_API_KEY in your hosting platform or .env.local.";
const SUPABASE_CONFIG_MESSAGE =
  "Optional: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your hosting platform or .env.local to persist snapshots.";
const DEMO_MODE_MESSAGE =
  "Optional: set ACADEMOS_FORCE_DEMO_MODE=true to force demo fallback mode even when Newton MCP is configured.";

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
  demoModeForced,
}) {
  const missing = [];

  if (!newtonConfigured && !demoModeForced) {
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
  const demoModeForced = ACADEMOS_FORCE_DEMO_MODE;
  const liveAcademicSyncAvailable = newtonConfigured && !demoModeForced;
  const ready = liveAcademicSyncAvailable && llmConfigured;
  const degraded = !ready;
  const missing = buildMissingSteps({
    newtonConfigured,
    llmConfigured,
    demoModeForced,
  });
  const optional = [];

  if (!supabaseConfigured) {
    optional.push(SUPABASE_CONFIG_MESSAGE);
  }

  optional.push(DEMO_MODE_MESSAGE);

  return {
    status: ready ? "ok" : "degraded",
    mode: ready ? "live" : "demo",
    degraded,
    message: buildRuntimeMessage({
      liveAcademicSyncAvailable,
      llmConfigured,
      supabaseConfigured,
      demoModeForced,
    }),
    notices: degraded
      ? [
          liveAcademicSyncAvailable ? "" : LIVE_SYNC_UNAVAILABLE_MESSAGE,
          ready || llmConfigured ? FALLBACK_GUIDANCE_MESSAGE : "",
        ].filter(Boolean)
      : [],
    config: {
      newtonConfigured,
      liveAcademicSyncAvailable,
      llmConfigured,
      geminiConfigured: llmConfigured,
      supabaseConfigured,
      demoModeForced,
      fallbackResponsesAvailable: true,
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
