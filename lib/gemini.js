import "server-only";

const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";
const ACADEMIC_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
    },
    tasks: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },
    insights: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },
  },
};

async function generateGeminiContent(
  query,
  {
    responseSchema = ACADEMIC_RESPONSE_SCHEMA,
    temperature = 0.2,
    maxOutputTokens = 1024,
  } = {},
) {
  const apiKey = getGeminiApiKey();
  const model = getConfiguredGeminiModel();

  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.",
    );
  }

  if (!query || typeof query !== "string") {
    throw new Error("Gemini requires a non-empty string query.");
  }

  const response = await fetch(
    `${GEMINI_API_BASE_URL}/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: query,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature,
          maxOutputTokens,
        },
      }),
    },
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Gemini API returned an invalid JSON response.");
  }

  if (!response.ok) {
    const message = data?.error?.message || "Gemini API request failed.";
    throw new Error(message);
  }

  const text = extractGeminiText(data);

  if (!text) {
    const blockReason = data?.promptFeedback?.blockReason;

    if (typeof blockReason === "string" && blockReason) {
      throw new Error(`Gemini returned no text content. Prompt blocked: ${blockReason}.`);
    }

    throw new Error("Gemini API returned no text content.");
  }

  return text;
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

export function getConfiguredGeminiModel() {
  return (
    process.env.GEMINI_MODEL ||
    process.env.GOOGLE_MODEL ||
    DEFAULT_GEMINI_MODEL
  );
}

export function isGeminiConfigured() {
  return Boolean(getGeminiApiKey());
}

function extractGeminiText(data) {
  const parts = Array.isArray(data?.candidates)
    ? data.candidates.flatMap((candidate) =>
        Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [],
      )
    : [];

  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();

  return text || "";
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function stripCodeFence(text) {
  const trimmed = String(text || "").trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return match ? match[1].trim() : trimmed;
}

function extractCodeBlockCandidates(text) {
  const matches = [...String(text || "").matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/gi)];

  return matches.map((match) => match[1].trim()).filter(Boolean);
}

function extractFirstBalancedJsonObject(text) {
  const input = String(text || "");

  for (let start = 0; start < input.length; start += 1) {
    if (input[start] !== "{") {
      continue;
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < input.length; index += 1) {
      const char = input[index];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === "\\") {
          escaped = true;
          continue;
        }

        if (char === "\"") {
          inString = false;
        }

        continue;
      }

      if (char === "\"") {
        inString = true;
        continue;
      }

      if (char === "{") {
        depth += 1;
        continue;
      }

      if (char !== "}") {
        continue;
      }

      depth -= 1;

      if (depth !== 0) {
        continue;
      }

      const candidate = input.slice(start, index + 1).trim();
      const parsed = tryParseJson(candidate);

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }

      break;
    }
  }

  return null;
}

export function parseGeminiJsonResponse(text) {
  const directCandidate = stripCodeFence(text);
  const direct = tryParseJson(directCandidate);

  if (direct && typeof direct === "object" && !Array.isArray(direct)) {
    return direct;
  }

  for (const candidate of extractCodeBlockCandidates(text)) {
    const parsed = tryParseJson(candidate);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  }

  return extractFirstBalancedJsonObject(text);
}

export async function askGemini(query) {
  return generateGeminiContent(query, {
    responseSchema: ACADEMIC_RESPONSE_SCHEMA,
    temperature: 0.2,
    maxOutputTokens: 1024,
  });
}

export async function askGeminiWithSchema(
  query,
  {
    responseSchema,
    temperature = 0.2,
    maxOutputTokens = 1024,
  } = {},
) {
  if (!responseSchema) {
    throw new Error("askGeminiWithSchema requires a response schema.");
  }

  return generateGeminiContent(query, {
    responseSchema,
    temperature,
    maxOutputTokens,
  });
}
