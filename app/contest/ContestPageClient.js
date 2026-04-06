"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "../../lib/public-config";
import ContestGuidancePanel from "./ContestGuidancePanel";
import ContestPrepForm from "./ContestPrepForm";
import styles from "./contest.module.css";

function getInitialContestPageData() {
  return {
    source: "frontend",
    status: {
      available: false,
      error: null,
    },
    upcomingContest: null,
    pastContests: [],
    pastContestSummary: null,
    emptyMessage: "Loading contest data...",
  };
}

function isValidContestPageData(data) {
  return Boolean(data && typeof data === "object" && data.status);
}

export default function ContestPageClient() {
  const [contestPageData, setContestPageData] = useState(getInitialContestPageData);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadContestPageData() {
      try {
        const response = await fetch(getApiUrl("/api/contest"), {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!isActive) {
          return;
        }

        if (isValidContestPageData(payload)) {
          setContestPageData(payload);
          setErrorMessage("");
          setStatusMessage(typeof payload?.notice === "string" ? payload.notice : "");
          return;
        }

        if (!response.ok) {
          throw new Error("Contest data is unavailable right now.");
        }

        setContestPageData(getInitialContestPageData());
        setErrorMessage("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setContestPageData((currentData) => ({
          ...currentData,
          status: {
            available: false,
            error:
              error instanceof Error
                ? error.message
                : "Contest data is unavailable right now.",
          },
          emptyMessage: "Contest data is unavailable right now.",
        }));
        setErrorMessage(
          error instanceof Error ? error.message : "Contest data is unavailable right now.",
        );
        setStatusMessage("");
      }
    }

    loadContestPageData();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      {errorMessage || statusMessage ? (
        <div className={styles.statusBanner} role="status">
          <p className={styles.statusBannerText}>{errorMessage || statusMessage}</p>
        </div>
      ) : null}

      <section className={styles.contentGrid} aria-label="Contest sections">
        <section className={`${styles.primaryCard} ${styles.prepCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>Upcoming Contest Prep</p>
              <h2 className={styles.cardTitle}>Get ready for the next contest</h2>
              <p className={styles.cardDescription}>
                {contestPageData.upcomingContest
                  ? `Newton currently lists ${contestPageData.upcomingContest.title} for ${contestPageData.upcomingContest.subjectName} on ${contestPageData.upcomingContest.dateLabel}. You can still use the manual form below to plan the week.`
                  : contestPageData.mode === "demo"
                    ? "Live academic sync is unavailable in this deployment. You can still save the next contest and use fallback prep guidance."
                    : "Use this space every Monday to save the next Friday contest and keep your prep details organized."}
              </p>
            </div>
            <p className={styles.cardMeta}>
              {contestPageData.upcomingContest
                ? "Planner + live check"
                : contestPageData.mode === "demo"
                  ? "Planner + fallback guidance"
                  : "Weekly planner"}
            </p>
          </div>

          {contestPageData.upcomingContest ? (
            <div className={styles.upcomingContestPanel}>
              <div className={styles.upcomingContestHeader}>
                <div>
                  <p className={styles.cardLabel}>Live Upcoming Contest</p>
                  <h3 className={styles.upcomingContestTitle}>
                    {contestPageData.upcomingContest.title}
                  </h3>
                </div>
                <p className={styles.cardMeta}>Newton record</p>
              </div>

              <div className={styles.upcomingContestGrid}>
                <div className={styles.upcomingContestRow}>
                  <p className={styles.upcomingContestLabel}>Subject</p>
                  <p className={styles.upcomingContestValue}>
                    {contestPageData.upcomingContest.subjectName}
                  </p>
                </div>

                <div className={styles.upcomingContestRow}>
                  <p className={styles.upcomingContestLabel}>Date</p>
                  <p className={styles.upcomingContestValue}>
                    {contestPageData.upcomingContest.dateLabel}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <ContestPrepForm />
        </section>

        <section className={`${styles.secondaryCard} ${styles.guidanceCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>AI Prep Guidance</p>
              <h2 className={styles.cardTitle}>Most important prep moves before the contest</h2>
              <p className={styles.cardDescription}>
                {contestPageData.mode === "demo"
                  ? "Guidance uses your saved contest details and clearly falls back when live academic comparison is unavailable."
                  : "Guidance is generated from your saved contest details and related live Newton academic records for the same subject."}
              </p>
            </div>
            <p className={styles.cardMeta}>
              {contestPageData.mode === "demo" ? "Fallback view" : "Priority view"}
            </p>
          </div>

          <ContestGuidancePanel />
        </section>
      </section>

      <section className={styles.scoresCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.cardLabel}>Past Contest Scores</p>
            <h2 className={styles.cardTitle}>Score history and previous results</h2>
            <p className={styles.cardDescription}>
              Only contest records from Newton are shown here, separate from
              assignments and quizzes.
            </p>
          </div>
          <p className={styles.cardMeta}>
            {contestPageData.status.available ? "Past records" : contestPageData.mode === "demo" ? "Fallback state" : "Unavailable"}
          </p>
        </div>

        {contestPageData.pastContests.length ? (
          <div className={styles.scoresContent}>
            {contestPageData.pastContestSummary ? (
              <p className={styles.scoresSummary}>{contestPageData.pastContestSummary}</p>
            ) : null}

            <div className={styles.subjectScoresGrid}>
              {contestPageData.pastContests.map((subject) => (
                <article
                  key={subject.subjectName}
                  className={styles.subjectScoreCard}
                  aria-label={`${subject.subjectName} contest history`}
                >
                  <div className={styles.subjectScoreHeader}>
                    <div>
                      <p className={styles.cardLabel}>Subject</p>
                      <h3 className={styles.subjectScoreTitle}>{subject.subjectName}</h3>
                    </div>
                    <p className={styles.cardMeta}>
                      {subject.contestCount}{" "}
                      {subject.contestCount === 1 ? "contest" : "contests"}
                    </p>
                  </div>

                  <ul className={styles.subjectContestList}>
                    {subject.entries.map((entry) => (
                      <li key={entry.id} className={styles.subjectContestItem}>
                        <div>
                          <p className={styles.subjectContestName}>{entry.title}</p>
                          <p className={styles.subjectContestDate}>{entry.dateLabel}</p>
                        </div>

                        {entry.scoreLabel || entry.rankLabel ? (
                          <div className={styles.subjectContestMeta}>
                            {entry.scoreLabel ? (
                              <span className={styles.scoreChip}>{entry.scoreLabel}</span>
                            ) : null}
                            {entry.rankLabel ? (
                              <span className={styles.scoreChipMuted}>{entry.rankLabel}</span>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyStateBox}>
            <p className={styles.emptyStateTitle}>{contestPageData.emptyMessage}</p>
            <p className={styles.emptyStateCopy}>
              {contestPageData.mode === "demo"
                ? "This section stays contest-only, so it remains empty until live contest history is available again."
                : "This section stays contest-only, so it remains empty when live contest history is not available."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
