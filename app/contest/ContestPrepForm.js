"use client";

import { useEffect, useState } from "react";
import {
  buildContestDraft,
  buildFormFromDraft,
  CONTEST_SAVED_EVENT,
  CONTEST_STORAGE_KEY,
  initialContestForm,
  isValidContestDraft,
  validateContestForm,
} from "../../lib/contest-draft";
import styles from "./contest.module.css";

function formatContestDate(value) {
  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export default function ContestPrepForm() {
  const [form, setForm] = useState(initialContestForm);
  const [errors, setErrors] = useState({});
  const [savedContest, setSavedContest] = useState(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CONTEST_STORAGE_KEY);

      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved);

      if (isValidContestDraft(parsed)) {
        setSavedContest(parsed);
        setForm(buildFormFromDraft(parsed));
      }
    } catch {
      // Ignore invalid local storage and keep the form empty.
    }
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const { errors: nextErrors, isValid, topics } = validateContestForm(form);

    if (!isValid) {
      setErrors(nextErrors);
      return;
    }

    const nextDraft = buildContestDraft(form, topics);

    setErrors({});
    setSavedContest(nextDraft);
    window.localStorage.setItem(CONTEST_STORAGE_KEY, JSON.stringify(nextDraft));
    window.dispatchEvent(
      new CustomEvent(CONTEST_SAVED_EVENT, {
        detail: nextDraft,
      }),
    );
  }

  return (
    <div className={styles.prepFormStack}>
      <div className={styles.prepContentGrid}>
        <form className={styles.prepForm} onSubmit={handleSubmit} noValidate>
          <div className={styles.formIntroBlock}>
            <div>
              <p className={styles.cardLabel}>Weekly Entry</p>
              <h3 className={styles.formIntroTitle}>Save the next contest once and reuse it everywhere</h3>
            </div>
            <p className={styles.formIntroCopy}>
              This saved contest powers the AI prep section and contest-related chat answers.
            </p>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Contest Name</span>
              <input
                className={styles.fieldInput}
                name="contestName"
                type="text"
                value={form.contestName}
                onChange={handleChange}
                placeholder="Example: Friday DSA Contest"
              />
              {errors.contestName ? (
                <span className={styles.fieldError}>{errors.contestName}</span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Contest Date</span>
              <input
                className={styles.fieldInput}
                name="contestDate"
                type="date"
                value={form.contestDate}
                onChange={handleChange}
              />
              {errors.contestDate ? (
                <span className={styles.fieldError}>{errors.contestDate}</span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Subject Name</span>
              <input
                className={styles.fieldInput}
                name="subjectName"
                type="text"
                value={form.subjectName}
                onChange={handleChange}
                placeholder="Example: DBMS"
              />
              {errors.subjectName ? (
                <span className={styles.fieldError}>{errors.subjectName}</span>
              ) : null}
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span className={styles.fieldLabel}>Syllabus / Topics</span>
              <textarea
                className={styles.fieldTextarea}
                name="syllabusInput"
                value={form.syllabusInput}
                onChange={handleChange}
                rows={5}
                placeholder="Use multiple lines or comma-separated topics like Trees, Graphs, DP"
              />
              <span className={styles.fieldHint}>
                You can enter one topic per line or use commas.
              </span>
              {errors.syllabusInput ? (
                <span className={styles.fieldError}>{errors.syllabusInput}</span>
              ) : null}
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span className={styles.fieldLabel}>Optional Notes</span>
              <textarea
                className={styles.fieldTextarea}
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Anything important for the week, revision plan, or special instructions"
              />
            </label>
          </div>

          <div className={styles.formActions}>
            <button className={styles.submitButton} type="submit">
              Save upcoming contest
            </button>
            <p className={styles.formActionCopy}>
              Saved locally in this browser so it can later support prep guidance and analysis.
            </p>
          </div>
        </form>

        <div className={styles.savedContestCard}>
          <div className={styles.savedContestHeader}>
            <div>
              <p className={styles.cardLabel}>Saved Contest</p>
              <h3 className={styles.savedContestTitle}>Current upcoming contest</h3>
              <p className={styles.savedContestHelper}>
                Keep this updated so your prep guidance stays aligned with the latest plan.
              </p>
            </div>
            <p className={styles.cardMeta}>
              {savedContest ? "Saved locally" : "No contest saved"}
            </p>
          </div>

          {savedContest ? (
            <div className={styles.savedContestBody}>
              <div className={styles.savedContestRow}>
                <p className={styles.savedContestLabel}>Contest name</p>
                <p className={styles.savedContestValue}>{savedContest.contestName}</p>
              </div>

              <div className={styles.savedContestRow}>
                <p className={styles.savedContestLabel}>Contest date</p>
                <p className={styles.savedContestValue}>
                  {formatContestDate(savedContest.contestDate)}
                </p>
              </div>

              <div className={styles.savedContestRow}>
                <p className={styles.savedContestLabel}>Subject</p>
                <p className={styles.savedContestValue}>{savedContest.subjectName}</p>
              </div>

              <div className={styles.topicBlock}>
                <p className={styles.topicBlockLabel}>Syllabus topics</p>
                <ul className={styles.savedTopicList}>
                  {savedContest.syllabus.topics.map((topic) => (
                    <li key={topic} className={styles.savedTopicItem}>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              {savedContest.notes ? (
                <div className={styles.savedNotesBlock}>
                  <p className={styles.savedContestLabel}>Notes</p>
                  <p className={styles.savedContestNotes}>{savedContest.notes}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className={styles.emptyStateBox}>
              <p className={styles.emptyStateTitle}>No upcoming contest saved yet.</p>
              <p className={styles.emptyStateCopy}>
                Save the form once to keep the next contest visible here in a clear,
                student-friendly format.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
