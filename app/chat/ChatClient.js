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

const initialSetupStatus = {
  checked: false,
  claudeConfigured: true,
  supabaseConfigured: true,
};

export default function ChatClient() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState(initialResponse);
  const [errorMessage, setErrorMessage] = useState("");
  const [setupStatus, setSetupStatus] = useState(initialSetupStatus);

  const hasResponse =
    Boolean(responseData.summary) ||
    responseData.tasks.length > 0 ||
    responseData.insights.length > 0;
  const isConfigured =
    setupStatus.claudeConfigured && setupStatus.supabaseConfigured;
  const setupIssues = [
    !setupStatus.supabaseConfigured ? "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" : null,
    !setupStatus.claudeConfigured ? "ANTHROPIC_API_KEY / CLAUDE_API_KEY" : null,
  ].filter(Boolean);

  useEffect(() => {
    let isActive = true;

    async function loadSetupStatus() {
      try {
        const response = await fetch("/api", { cache: "no-store" });
        const data = await response.json();

        if (!isActive) {
          return;
        }

        setSetupStatus({
          checked: true,
          claudeConfigured: Boolean(data?.config?.claudeConfigured),
          supabaseConfigured: Boolean(data?.config?.supabaseConfigured),
        });
      } catch {
        if (!isActive) {
          return;
        }

        setSetupStatus({
          checked: true,
          claudeConfigured: false,
          supabaseConfigured: false,
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
      setErrorMessage(
        `Setup required before reasoning can run: ${setupIssues.join(", ")}.`,
      );
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
            disabled={isLoading || !isConfigured}
          >
            {isLoading
              ? "Syncing..."
              : !isConfigured
                ? "Setup Required"
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
                Backend is syncing Newton MCP data to Supabase and sending the stored record to Claude...
              </p>
            ) : setupStatus.checked && !isConfigured ? (
              <p className={styles.errorMessage}>
                Setup required before academic reasoning can run: {setupIssues.join(", ")}.
              </p>
            ) : errorMessage ? (
              <p className={styles.errorMessage}>{errorMessage}</p>
            ) : hasResponse ? (
              <div className={styles.responseContent}>
                <p className={styles.sourceBadge}>
                  {responseData.source === "supabase-claude"
                    ? "MCP -> Backend -> Supabase -> Claude"
                    : "Response ready"}
                </p>
                {responseData.snapshotId ? (
                  <p className={styles.emptyText}>
                    Snapshot ID: {responseData.snapshotId}
                  </p>
                ) : null}

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
