"use client";

import { useEffect, useState } from "react";
import {
  CONTEST_SAVED_EVENT,
  CONTEST_STORAGE_KEY,
  isValidContestDraft,
} from "../../lib/contest-draft";
import { getApiUrl } from "../../lib/public-config";
import styles from "./contest.module.css";

function readSavedContest() {
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

export default function ContestGuidancePanel() {
  const [contest, setContest] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setContest(readSavedContest());

    function handleContestSaved(event) {
      const nextContest = isValidContestDraft(event?.detail) ? event.detail : readSavedContest();
      setContest(nextContest);
    }

    function handleStorage(event) {
      if (event.key && event.key !== CONTEST_STORAGE_KEY) {
        return;
      }

      setContest(readSavedContest());
    }

    window.addEventListener(CONTEST_SAVED_EVENT, handleContestSaved);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CONTEST_SAVED_EVENT, handleContestSaved);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!contest) {
      setGuidance(null);
      setError("");
      setIsLoading(false);
      return undefined;
    }

    const abortController = new AbortController();

    async function fetchGuidance() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(getApiUrl("/api/contest/guidance"), {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ contest }),
          signal: abortController.signal,
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Contest prep guidance is unavailable right now.");
        }

        setGuidance(payload);
      } catch (fetchError) {
        if (abortController.signal.aborted) {
          return;
        }

        setGuidance(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Contest prep guidance is unavailable right now.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchGuidance();

    return () => {
      abortController.abort();
    };
  }, [contest]);

  if (!contest) {
    return (
      <div className={styles.emptyStateBox}>
        <p className={styles.emptyStateTitle}>Save an upcoming contest to generate prep guidance.</p>
        <p className={styles.emptyStateCopy}>
          The AI section uses your saved contest subject, syllabus topics, and notes, then
          adds live academic comparison when it is available.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.guidanceLoadingState}>
        <p className={styles.emptyStateTitle}>Building your contest prep plan...</p>
        <p className={styles.emptyStateCopy}>
          Comparing your saved contest details with any available academic context.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyStateBox}>
        <p className={styles.emptyStateTitle}>Prep guidance is unavailable right now.</p>
        <p className={styles.emptyStateCopy}>{error}</p>
      </div>
    );
  }

  if (!guidance) {
    return null;
  }

  const sourceLabel =
    guidance.source === "gemini"
      ? "AI guidance"
      : guidance.source === "fallback"
        ? "Live fallback"
        : guidance.source === "demo-gemini"
          ? "Demo guidance"
          : "Fallback guidance";

  const sections = [
    {
      key: "actionItems",
      label: "Action Items",
      title: "Do this first",
      items: Array.isArray(guidance.actionItems) ? guidance.actionItems : [],
      emptyLabel: "No urgent contest actions are available right now.",
      priority: true,
    },
    {
      key: "focusTopics",
      label: "Focus Topics",
      title: "Where to focus",
      items: Array.isArray(guidance.focusTopics) ? guidance.focusTopics : [],
      emptyLabel: "No specific weak-topic signal was found in the current academic record.",
    },
    {
      key: "reviseClasses",
      label: "Revise Classes",
      title: "Classes to revise",
      items: Array.isArray(guidance.reviseClasses) ? guidance.reviseClasses : [],
      emptyLabel: "No specific lecture revision target was found right now.",
    },
    {
      key: "insights",
      label: "Insights",
      title: "What stands out",
      items: Array.isArray(guidance.insights) ? guidance.insights : [],
      emptyLabel: "No extra prep insight is available right now.",
    },
  ];

  return (
    <div className={styles.guidanceStack}>
      <div className={styles.guidanceSummaryCard}>
        <div className={styles.guidanceSummaryHeader}>
          <div>
            <p className={styles.cardLabel}>Saved Contest Context</p>
            <h3 className={styles.guidanceSummaryTitle}>{contest.contestName}</h3>
          </div>
          <p className={styles.cardMeta}>{sourceLabel}</p>
        </div>

        <p className={styles.guidanceSummaryText}>{guidance.summary}</p>

        {guidance.notice ? (
          <p className={styles.emptyStateCopy}>{guidance.notice}</p>
        ) : null}

        <div className={styles.guidanceMetaRow}>
          <span className={styles.guidanceMetaPill}>{contest.subjectName}</span>
          <span className={styles.guidanceMetaPill}>{contest.contestDate}</span>
          <span className={styles.guidanceMetaPill}>
            {contest.syllabus.topics.length}{" "}
            {contest.syllabus.topics.length === 1 ? "topic" : "topics"}
          </span>
        </div>
      </div>

      <div className={styles.guidanceGrid}>
        {sections.map((section) => (
          <article
            key={section.key}
            className={
              section.priority
                ? `${styles.guidanceSectionCard} ${styles.guidanceSectionCardPriority}`
                : styles.guidanceSectionCard
            }
          >
            <div className={styles.guidanceSectionHeader}>
              <p className={styles.cardLabel}>{section.label}</p>
              <h3 className={styles.guidanceSectionTitle}>{section.title}</h3>
            </div>

            {section.items.length ? (
              <ul className={styles.guidanceList}>
                {section.items.map((item, index) => (
                  <li key={`${section.key}-${index}-${item}`} className={styles.guidanceListItem}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.guidanceEmptyText}>{section.emptyLabel}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
