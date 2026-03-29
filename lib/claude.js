import "server-only";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";

function getClaudeApiKey() {
  return process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
}

export function getConfiguredClaudeModel() {
  return (
    process.env.ANTHROPIC_MODEL ||
    process.env.CLAUDE_MODEL ||
    DEFAULT_CLAUDE_MODEL
  );
}

export function isClaudeConfigured() {
  return Boolean(getClaudeApiKey());
}

export async function askClaude(query) {
  const apiKey = getClaudeApiKey();
  const model = getConfiguredClaudeModel();

  if (!apiKey) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY or CLAUDE_API_KEY environment variable.",
    );
  }

  if (!query || typeof query !== "string") {
    throw new Error("askClaude requires a non-empty string query.");
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: query,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || "Claude API request failed.";
    throw new Error(message);
  }

  const text = data.content
    ?.filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Claude API returned no text content.");
  }

  return text;
}
