"use client";

import { useEffect, useState } from "react";
import {
  CONTEST_STORAGE_KEY,
  isValidContestDraft,
} from "../../lib/contest-draft";
import { getApiUrl } from "../../lib/public-config";
import styles from "./chat.module.css";

const initialResponse = {
  summary: "",
  tasks: [],
  insights: [],
  source: "",
  mode: "",
  notice: "",
  snapshotId: "",
};

const fallbackSetupStatus = {
  checked: false,
  status: "degraded",
  mode: "demo",
  newtonConfigured: false,
  liveAcademicSyncAvailable: false,
  llmConfigured: false,
  supabaseConfigured: false,
  fallbackResponsesAvailable: true,
  message: "Checking runtime status...",
  notices: [],
  missing: [],
  optional: [],
  commands: {
    addNewton: "",
    loginNewton: "",
    restartDevServer: "",
  },
};

const exampleQueries = [
  "What's due this week?",
  "Attendance status",
  "Quiz dates",
  "Next deadline",
  "Subject progress",
];

function readSavedContestDraft() {
  try {
    const savedValue = window.localStorage.getItem(CONTEST_STORAGE_KEY);

    if (!savedValue) {
      return null;
    }

    const parsedValue = JSON.parse(savedValue);
    return isValidContestDraft(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

function normalizeSetupStatus(data, checked = true) {
  return {
    checked,
    status: typeof data?.status === "string" ? data.status : "degraded",
    mode: typeof data?.mode === "string" ? data.mode : "demo",
    newtonConfigured: Boolean(data?.config?.newtonConfigured),
    liveAcademicSyncAvailable: Boolean(data?.config?.liveAcademicSyncAvailable),
    llmConfigured: Boolean(
      data?.config?.llmConfigured ??
        data?.config?.geminiConfigured ??
        data?.config?.claudeConfigured,
    ),
    supabaseConfigured: Boolean(data?.config?.supabaseConfigured),
    fallbackResponsesAvailable:
      typeof data?.config?.fallbackResponsesAvailable === "boolean"
        ? data.config.fallbackResponsesAvailable
        : true,
    message:
      typeof data?.message === "string"
        ? data.message
        : fallbackSetupStatus.message,
    notices: Array.isArray(data?.notices) ? data.notices : [],
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
  const canSubmit =
    setupStatus.checked &&
    (setupStatus.llmConfigured || setupStatus.fallbackResponsesAvailable);
  const isLiveMode = setupStatus.mode === "live";
  const setupMessage = setupStatus.message;
  const technicalSourceLabel = getTechnicalSourceLabel(responseData.source);
  const readinessItems = [
    {
      label: "Records",
      value: setupStatus.liveAcademicSyncAvailable ? "Live" : "Demo",
    },
    {
      label: "Reasoning",
      value: setupStatus.llmConfigured ? "Ready" : "Basic",
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
        const response = await fetch(getApiUrl("/api"), { cache: "no-store" });
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
          status: "degraded",
          mode: "demo",
          newtonConfigured: false,
          liveAcademicSyncAvailable: false,
          llmConfigured: false,
          supabaseConfigured: false,
          message:
            "Live academic sync is unavailable in this deployment. You can still try fallback guidance if the backend is reachable.",
          fallbackResponsesAvailable: true,
          notices: [],
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

    if (!query.trim()) {
      setErrorMessage("Please enter a question before sending the request.");
      setResponseData(initialResponse);
      return;
    }

    if (!canSubmit) {
      setErrorMessage("Academos is still checking runtime availability. Please try again in a moment.");
      setResponseData(initialResponse);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setResponseData(initialResponse);

    try {
      const request = await fetch(getApiUrl("/api/ask"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          contest: readSavedContestDraft(),
        }),
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
        mode: typeof data.mode === "string" ? data.mode : "",
        notice: typeof data.notice === "string" ? data.notice : "",
        snapshotId: typeof data.snapshotId === "string" ? data.snapshotId : "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.name === "AbortError"
          ? "The request was interrupted before Academos could finish."
          : "Unable to reach Academos right now.",
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

  function getTechnicalSourceLabel(source) {
    const labels = {
      "supabase-gemini": "Newton MCP -> Next.js backend -> Supabase -> Gemini",
      "contest-gemini": "Saved contest -> Newton MCP -> Next.js backend -> Gemini",
      "contest-fallback": "Saved contest -> Newton MCP -> Next.js backend",
      "contest-demo-gemini": "Saved contest -> Gemini fallback guidance",
      "contest-demo-fallback": "Saved contest -> Static fallback guidance",
      "contest-missing": "Saved contest required",
      gemini: "Newton MCP -> Next.js backend -> Gemini",
      "demo-stored-gemini": "Stored snapshot -> Gemini fallback guidance",
      "demo-general-gemini": "General reasoning -> Gemini fallback guidance",
      "demo-stored-fallback": "Stored snapshot -> Static fallback guidance",
      "demo-static": "General reasoning -> Static fallback guidance",
    };

    return labels[source] || source || "Response ready";
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
            disabled={isLoading || isSetupLoading}
          >
            {isLoading
              ? "Preparing answer..."
              : isSetupLoading
                ? "Checking runtime..."
              : "Ask Academos"}
          </button>
          <p className={styles.helperText}>
            {isLiveMode
              ? "Answers stay grounded in your live academic records."
              : "Fallback answers stay usable even when live academic sync is unavailable."}
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
              Live student data still comes from Newton MCP when available. In demo
              mode, Academos switches to fallback guidance instead of blocking the UI.
            </p>
            <p className={styles.detailsText}>
              Current runtime message: {setupMessage}
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
              <span className={styles.resultBadge}>
                {responseData.mode === "live" ? "Live answer" : "Fallback answer"}
              </span>
            ) : null}
          </div>
          <div className={styles.responseBox} aria-live="polite">
            {isLoading ? (
              <div className={styles.loadingState}>
                <p className={styles.loadingTitle}>Preparing your answer</p>
                <p className={styles.statusMessage}>
                  Academos is preparing the best available answer for this deployment.
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
                <p className={styles.loadingTitle}>Checking runtime</p>
                <p className={styles.statusMessage}>{setupMessage}</p>
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
                    {responseData.mode === "live"
                      ? "Grounded in live academic records"
                      : "Fallback guidance"}
                  </p>
                  {responseData.source === "supabase-gemini" ? (
                    <span className={styles.metaPill}>Saved snapshot enabled</span>
                  ) : null}
                </div>

                {responseData.notice ? (
                  <p className={styles.emptyText}>{responseData.notice}</p>
                ) : null}

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
                <p className={styles.emptyStateTitle}>
                  {isLiveMode
                    ? "Ask a question to get a live academic answer"
                    : "Ask a question to get fallback academic guidance"}
                </p>
                <p className={styles.emptyStateText}>
                  {isLiveMode
                    ? "Start with deadlines, attendance, schedule, quizzes, or the subject that needs the most attention."
                    : "Live academic sync is unavailable in this deployment. You can still ask about priorities, deadlines, attendance risk, or contest prep and get clearly labeled fallback guidance."}
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
