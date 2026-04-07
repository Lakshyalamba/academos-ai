"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CONTEST_SAVED_EVENT,
  CONTEST_STORAGE_KEY,
  isValidContestDraft,
} from "../../lib/contest-draft";
import { getApiUrl } from "../../lib/public-config";
import styles from "./dashboard.module.css";

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

function formatContestDate(value) {
  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getSourceLabel(source) {
  switch (source) {
    case "gemini":
      return "AI guidance";
    case "fallback":
      return "Live fallback";
    case "demo-gemini":
      return "Demo guidance";
    default:
      return "Fallback guidance";
  }
}

export default function ContestPrepCard() {
  const [contest, setContest] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setContest(readSavedContest());

    function handleContestSaved(event) {
      const nextContest = isValidContestDraft(event?.detail)
        ? event.detail
        : readSavedContest();
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

  const actionItems = Array.isArray(guidance?.actionItems)
    ? guidance.actionItems.slice(0, 3)
    : [];

  return (
    <section className={styles.dashboardCard} aria-label="Contest prep">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleBlock}>
          <p className={styles.cardLabel}>Contest Prep</p>
          <h2 className={styles.sectionTitle}>Contest prep</h2>
          <p className={styles.sectionDescription}>Saved contest and next steps.</p>
        </div>
        <Link href="/contest" className={styles.inlineLink}>
          Open full page
        </Link>
      </div>

      {!contest ? (
        <div className={styles.stateBox}>
          <p className={styles.stateTitle}>No contest saved yet.</p>
          <p className={styles.stateCopy}>Save a contest to show it here.</p>
        </div>
      ) : (
        <div className={styles.contestStack}>
          <div className={styles.contestSummaryCard}>
            <div className={styles.contestSummaryHeader}>
              <div>
                <p className={styles.cardLabel}>Saved Contest</p>
                <h3 className={styles.subCardTitle}>{contest.contestName}</h3>
              </div>
              <p className={styles.cardMeta}>
                {guidance ? getSourceLabel(guidance.source) : "Saved locally"}
              </p>
            </div>

            <div className={styles.contestMetaRow}>
              <span className={styles.contestMetaPill}>{contest.subjectName}</span>
              <span className={styles.contestMetaPill}>
                {formatContestDate(contest.contestDate)}
              </span>
              <span className={styles.contestMetaPill}>
                {contest.syllabus.topics.length}{" "}
                {contest.syllabus.topics.length === 1 ? "topic" : "topics"}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.stateBox}>
              <p className={styles.stateTitle}>Building your prep plan...</p>
              <p className={styles.stateCopy}>
                Reviewing your saved contest and available academic context.
              </p>
            </div>
          ) : error ? (
            <div className={styles.stateBox}>
              <p className={styles.stateTitle}>Prep guidance is unavailable right now.</p>
              <p className={styles.stateCopy}>{error}</p>
            </div>
          ) : guidance ? (
            <div className={styles.contestGuidanceCard}>
              <p className={styles.contestGuidanceSummary}>{guidance.summary}</p>

              {actionItems.length ? (
                <ul className={styles.contestActionList}>
                  {actionItems.map((item, index) => (
                    <li key={`${index}-${item}`} className={styles.contestActionItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.inlineState}>
                  No urgent contest actions are available right now.
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
