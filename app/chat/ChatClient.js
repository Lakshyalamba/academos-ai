"use client";

import { useEffect, useState } from "react";
import styles from "./chat.module.css";

const initialResponse = {
  summary: "",
  tasks: [],
  insights: [],
  source: "",
  snapshotId: "",
};

const fallbackSetupStatus = {
  checked: false,
  newtonConfigured: false,
  llmConfigured: false,
  supabaseConfigured: false,
  message: "Checking local setup status...",
  missing: [],
  optional: [],
  commands: {
    addNewton: "",
    loginNewton: "",
    restartDevServer: "",
  },
};

function normalizeSetupStatus(data, checked = true) {
  return {
    checked,
    newtonConfigured: Boolean(data?.config?.newtonConfigured),
    llmConfigured: Boolean(
      data?.config?.llmConfigured ??
        data?.config?.geminiConfigured ??
        data?.config?.claudeConfigured,
    ),
    supabaseConfigured: Boolean(data?.config?.supabaseConfigured),
    message:
      typeof data?.message === "string"
        ? data.message
        : fallbackSetupStatus.message,
    missing: Array.isArray(data?.missing) ? data.missing : [],
    optional: Array.isArray(data?.optional) ? data.optional : [],
    commands: {
      addNewton:
        typeof data?.commands?.addNewton === "string"
          ? data.commands.addNewton
          : "",
      loginNewton:
        typeof data?.commands?.loginNewton === "string"
          ? data.commands.loginNewton
          : "",
      restartDevServer:
        typeof data?.commands?.restartDevServer === "string"
          ? data.commands.restartDevServer
          : "",
    },
  };
}

export default function ChatClient({ initialSetupStatus }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState(initialResponse);
  const [errorMessage, setErrorMessage] = useState("");
  const [setupStatus, setSetupStatus] = useState(() =>
    initialSetupStatus
      ? normalizeSetupStatus(initialSetupStatus)
      : fallbackSetupStatus,
  );

  const hasResponse =
    Boolean(responseData.summary) ||
    responseData.tasks.length > 0 ||
    responseData.insights.length > 0;
  const isSetupLoading = !setupStatus.checked;
  const isConfigured =
    setupStatus.newtonConfigured &&
    setupStatus.llmConfigured;
  const setupMessage = setupStatus.message;
  const technicalSourceLabel =
    responseData.source === "supabase-gemini"
      ? "Newton MCP -> Backend -> Supabase -> Gemini"
      : responseData.source === "gemini"
        ? "Newton MCP -> Backend -> Gemini"
        : responseData.source || "Response ready";

  useEffect(() => {
    let isActive = true;

    async function loadSetupStatus() {
      try {
        const response = await fetch("/api", { cache: "no-store" });
        const data = await response.json();

        if (!isActive) {
          return;
        }

        setSetupStatus(normalizeSetupStatus(data));
      } catch {
        if (!isActive) {
          return;
        }

        setSetupStatus({
          checked: true,
          newtonConfigured: false,
          llmConfigured: false,
          supabaseConfigured: false,
          message:
            "Unable to read local setup status. Make sure the dev server is running and the backend can read your Codex MCP and .env.local configuration.",
          missing: [],
          optional: [],
          commands: fallbackSetupStatus.commands,
        });
      }
    }

    loadSetupStatus();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isConfigured) {
      setErrorMessage(setupMessage);
      setResponseData(initialResponse);
      return;
    }

    if (!query.trim()) {
      setErrorMessage("Please enter a question before sending the request.");
      setResponseData(initialResponse);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setResponseData(initialResponse);

    try {
      const request = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await request.json();

      if (!request.ok) {
        setErrorMessage(data.error || "Request failed.");
        setResponseData(initialResponse);
        return;
      }

      setResponseData({
        summary: typeof data.summary === "string" ? data.summary : "",
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        insights: Array.isArray(data.insights) ? data.insights : [],
        source: typeof data.source === "string" ? data.source : "",
        snapshotId: typeof data.snapshotId === "string" ? data.snapshotId : "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to reach the API route.",
      );
      setResponseData(initialResponse);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className={styles.layout}>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <label htmlFor="chat-query" className={styles.label}>
          Ask a question
        </label>
        <input
          id="chat-query"
          name="query"
          type="text"
          className={styles.input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="What should I do today?"
          autoComplete="off"
          disabled={isLoading}
        />

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.button}
            disabled={isLoading || isSetupLoading || !isConfigured}
          >
            {isLoading
              ? "Syncing..."
              : isSetupLoading
                ? "Checking Setup..."
              : !isConfigured
                ? "Finish Local Setup"
                : "Run Academic Reasoning"}
          </button>
        </div>
      </form>

      <div className={styles.resultsColumn}>
        <section className={styles.resultCard}>
          <p className={styles.cardLabel}>Response</p>
          <div className={styles.responseBox} aria-live="polite">
            {isLoading ? (
              <p className={styles.statusMessage}>
                Backend is fetching Newton MCP data and sending the academic snapshot to Gemini...
              </p>
            ) : isSetupLoading ? (
              <p className={styles.statusMessage}>{setupMessage}</p>
            ) : setupStatus.checked && !isConfigured ? (
              <div className={styles.setupState}>
                <p className={styles.errorMessage}>{setupMessage}</p>
                {setupStatus.missing.length > 0 ? (
                  <ul className={styles.list}>
                    {setupStatus.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {setupStatus.optional.length > 0 ? (
                  <ul className={styles.list}>
                    {setupStatus.optional.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {setupStatus.commands.loginNewton ? (
                  <p className={styles.emptyText}>
                    If Newton asks for authentication later, run{" "}
                    <code>{setupStatus.commands.loginNewton}</code>.
                  </p>
                ) : null}
              </div>
            ) : errorMessage ? (
              <p className={styles.errorMessage}>{errorMessage}</p>
            ) : hasResponse ? (
              <div className={styles.responseContent}>
                <p className={styles.sourceBadge}>
                  Verified from your Newton academic data
                </p>

                <section className={styles.responseSection}>
                  <h2 className={styles.sectionTitle}>Summary</h2>
                  <p className={styles.summaryText}>{responseData.summary}</p>
                </section>

                <section className={styles.responseSection}>
                  <h2 className={styles.sectionTitle}>Tasks</h2>
                  {responseData.tasks.length > 0 ? (
                    <ul className={styles.list}>
                      {responseData.tasks.map((task, index) => (
                        <li key={`${task}-${index}`}>{task}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.emptyText}>No tasks returned.</p>
                  )}
                </section>

                <section className={styles.responseSection}>
                  <h2 className={styles.sectionTitle}>Insights</h2>
                  {responseData.insights.length > 0 ? (
                    <ul className={styles.list}>
                      {responseData.insights.map((insight, index) => (
                        <li key={`${insight}-${index}`}>{insight}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.emptyText}>No insights returned.</p>
                  )}
                </section>

                {(responseData.source || responseData.snapshotId) ? (
                  <details className={styles.responseSection}>
                    <summary className={styles.sectionTitle}>Technical details</summary>
                    <div className={styles.responseSection}>
                      {responseData.source ? (
                        <p className={styles.emptyText}>
                          Pipeline: {technicalSourceLabel}
                        </p>
                      ) : null}
                      {responseData.snapshotId ? (
                        <p className={styles.emptyText}>
                          Snapshot ID: {responseData.snapshotId}
                        </p>
                      ) : null}
                    </div>
                  </details>
                ) : null}
              </div>
            ) : (
              <p className={styles.emptyState}>
                Ask about attendance, quizzes, contests, calendar, arena, or subject performance.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
