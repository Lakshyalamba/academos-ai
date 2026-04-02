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

const exampleQueries = [
  "What should I focus on this week?",
  "Do I have any overdue work or attendance risk?",
  "Summarize my upcoming classes, quizzes, and deadlines.",
  "Which subject needs the most attention right now?",
];

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
      ? "Newton MCP -> Next.js backend -> Supabase -> Gemini"
      : responseData.source === "gemini"
        ? "Newton MCP -> Next.js backend -> Gemini"
        : responseData.source || "Response ready";
  const readinessItems = [
    {
      label: "Records",
      value: setupStatus.newtonConfigured ? "Ready" : "Missing",
    },
    {
      label: "Reasoning",
      value: setupStatus.llmConfigured ? "Ready" : "Missing",
    },
    {
      label: "Saved snapshots",
      value: setupStatus.supabaseConfigured ? "Enabled" : "Optional",
    },
  ];
  const loadingSteps = [
    "Checking your latest academic records",
    "Looking for deadlines, schedule updates, and risk signals",
    "Preparing a concise answer with tasks and insights",
  ];

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

  function handleExampleClick(value) {
    setQuery(value);
    setErrorMessage("");
  }

  function getItemCountLabel(items, singular, plural) {
    if (!Array.isArray(items) || items.length === 0) {
      return "No items";
    }

    return `${items.length} ${items.length === 1 ? singular : plural}`;
  }

  return (
    <section className={styles.layout}>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <label htmlFor="chat-query" className={styles.label}>
            Ask about your academics
          </label>
          <p className={styles.formIntro}>
            Start with a question a student would actually ask. Academos will
            return a short summary, recommended tasks, and useful insights.
          </p>
        </div>

        <textarea
          id="chat-query"
          name="query"
          className={styles.textarea}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="What should I focus on this week?"
          autoComplete="off"
          disabled={isLoading}
          rows={6}
        />

        <div className={styles.examples}>
          <p className={styles.examplesLabel}>Try one of these</p>
          <div className={styles.examplesList}>
            {exampleQueries.map((item) => (
              <button
                key={item}
                type="button"
                className={styles.exampleButton}
                onClick={() => handleExampleClick(item)}
                disabled={isLoading}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.button}
            disabled={isLoading || isSetupLoading || !isConfigured}
          >
            {isLoading
              ? "Preparing answer..."
              : isSetupLoading
                ? "Checking setup..."
              : !isConfigured
                ? "Complete local setup"
                : "Ask Academos"}
          </button>
          <p className={styles.helperText}>
            {isConfigured
              ? "Answers stay grounded in your academic records."
              : "Live answers unlock after setup is complete."}
          </p>
        </div>

        <div className={styles.statusGrid} aria-label="Runtime status">
          {readinessItems.map((item) => (
            <div key={item.label} className={styles.statusItem}>
              <span className={styles.statusLabel}>{item.label}</span>
              <strong className={styles.statusValue}>{item.value}</strong>
            </div>
          ))}
        </div>

        <details className={styles.detailsCard}>
          <summary className={styles.detailsSummary}>Technical details</summary>
          <div className={styles.detailsBody}>
            <p className={styles.detailsText}>
              Live student data still comes from Newton MCP. Gemini formats the
              response, and Supabase continues to store snapshots when it is
              configured.
            </p>
            <p className={styles.detailsText}>
              Current setup message: {setupMessage}
            </p>
          </div>
        </details>
      </form>

      <div className={styles.resultsColumn}>
        <section className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.cardLabel}>Answer</p>
              <h2 className={styles.resultTitle}>Your academic snapshot</h2>
            </div>
            {hasResponse ? (
              <span className={styles.resultBadge}>Verified answer</span>
            ) : null}
          </div>
          <div className={styles.responseBox} aria-live="polite">
            {isLoading ? (
              <div className={styles.loadingState}>
                <p className={styles.loadingTitle}>Preparing your answer</p>
                <p className={styles.statusMessage}>
                  Academos is checking your records and organizing the most
                  important signals into a clean response.
                </p>
                <ul className={styles.loadingList}>
                  {loadingSteps.map((step) => (
                    <li key={step} className={styles.loadingListItem}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ) : isSetupLoading ? (
              <div className={styles.loadingState}>
                <p className={styles.loadingTitle}>Checking setup</p>
                <p className={styles.statusMessage}>{setupMessage}</p>
              </div>
            ) : setupStatus.checked && !isConfigured ? (
              <div className={styles.setupState}>
                <p className={styles.setupTitle}>Complete local setup to ask live academic questions</p>
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
              <div className={styles.setupState}>
                <p className={styles.setupTitle}>Academos could not prepare an answer</p>
                <p className={styles.errorMessage}>{errorMessage}</p>
              </div>
            ) : hasResponse ? (
              <div className={styles.responseContent}>
                <div className={styles.responseHeader}>
                  <p className={styles.sourceBadge}>
                    Verified from your academic records
                  </p>
                  {responseData.source === "supabase-gemini" ? (
                    <span className={styles.metaPill}>Saved snapshot enabled</span>
                  ) : null}
                </div>

                <section className={styles.responseSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Summary</h2>
                    <span className={styles.sectionMeta}>Student-friendly view</span>
                  </div>
                  <p className={styles.summaryText}>{responseData.summary}</p>
                </section>

                <section className={styles.responseSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Recommended tasks</h2>
                    <span className={styles.sectionMeta}>
                      {getItemCountLabel(responseData.tasks, "task", "tasks")}
                    </span>
                  </div>
                  {responseData.tasks.length > 0 ? (
                    <ul className={styles.responseList}>
                      {responseData.tasks.map((task, index) => (
                        <li key={`${task}-${index}`}>{task}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.emptyText}>
                      No urgent tasks were highlighted in this answer.
                    </p>
                  )}
                </section>

                <section className={styles.responseSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Key insights</h2>
                    <span className={styles.sectionMeta}>
                      {getItemCountLabel(responseData.insights, "insight", "insights")}
                    </span>
                  </div>
                  {responseData.insights.length > 0 ? (
                    <ul className={styles.responseList}>
                      {responseData.insights.map((insight, index) => (
                        <li key={`${insight}-${index}`}>{insight}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.emptyText}>
                      No additional academic trends surfaced for this question.
                    </p>
                  )}
                </section>

                {(responseData.source || responseData.snapshotId) ? (
                  <details className={styles.detailsCard}>
                    <summary className={styles.detailsSummary}>Technical details</summary>
                    <div className={styles.detailsBody}>
                      {responseData.source ? (
                        <p className={styles.detailsText}>
                          Processing path: {technicalSourceLabel}
                        </p>
                      ) : null}
                      {responseData.snapshotId ? (
                        <p className={styles.detailsText}>
                          Snapshot ID: {responseData.snapshotId}
                        </p>
                      ) : null}
                    </div>
                  </details>
                ) : null}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateTitle}>Ask a question to get a verified academic answer</p>
                <p className={styles.emptyStateText}>
                  Start with deadlines, attendance, schedule, quizzes, or the
                  subject that needs the most attention.
                </p>
                <div className={styles.examplesList}>
                  {exampleQueries.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={styles.exampleButton}
                      onClick={() => handleExampleClick(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
