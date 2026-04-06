import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

function getEnvValue(name, fallback = "") {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

const port = getEnvValue("PORT", "3000");
const host = getEnvValue("HOSTNAME", getEnvValue("HOST", "0.0.0.0"));

const child = spawn(
  process.execPath,
  [nextBin, "start", "--hostname", host, "--port", port],
  {
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("Unable to start the Next.js production server.", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
