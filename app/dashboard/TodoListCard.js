"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

const STORAGE_KEY = "academos-dashboard-todo-list";

function buildTodoItem(text) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    completed: false,
  };
}

export default function TodoListCard() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState("");
  const [isReady, setIsReady] = useState(false);
  const openItemsCount = items.filter((item) => !item.completed).length;
  const completedItemsCount = items.length - openItemsCount;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setIsReady(true);
        return;
      }

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setItems(
          parsed.filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              typeof item.text === "string" &&
              typeof item.completed === "boolean",
          ),
        );
      }
    } catch {
      // Ignore invalid local storage and fall back to an empty list.
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [isReady, items]);

  function handleSubmit(event) {
    event.preventDefault();

    const text = draft.trim();

    if (!text) {
      return;
    }

    setItems((currentItems) => [buildTodoItem(text), ...currentItems]);
    setDraft("");
  }

  function handleToggle(id) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  }

  return (
    <section className={styles.subCard} aria-label="Personal to-do list">
      <div className={styles.subCardHeader}>
        <div className={styles.sectionTitleBlock}>
          <p className={styles.cardLabel}>Personal To-Do</p>
          <h3 className={styles.subCardTitle}>Personal checklist</h3>
        </div>
        <p className={styles.cardMeta}>
          {items.length === 0
            ? "No tasks yet"
            : openItemsCount === 0
              ? "All done"
              : `${openItemsCount} open`}
        </p>
      </div>

      <div className={styles.todoStats}>
        <span className={styles.todoStat}>{openItemsCount} open</span>
        <span className={styles.todoStat}>{completedItemsCount} done</span>
      </div>

      <form className={styles.todoForm} onSubmit={handleSubmit}>
        <label className={styles.visuallyHidden} htmlFor="dashboard-todo-input">
          Add a task
        </label>
        <div className={styles.todoInputRow}>
          <input
            id="dashboard-todo-input"
            className={styles.todoInput}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a quick study task"
            maxLength={120}
          />
          <button className={styles.todoAddButton} type="submit">
            Add task
          </button>
        </div>
      </form>

      {!isReady ? (
        <p className={styles.inlineState}>Loading...</p>
      ) : items.length > 0 ? (
        <ul className={styles.todoChecklist}>
          {items.map((item) => (
            <li key={item.id} className={styles.todoChecklistItem}>
              <label className={styles.todoCheckboxRow}>
                <input
                  className={styles.todoCheckbox}
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggle(item.id)}
                />
                <span
                  className={`${styles.todoChecklistText} ${
                    item.completed ? styles.todoChecklistTextDone : ""
                  }`}
                >
                  {item.text}
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.inlineState}>
          No personal tasks yet. Add one to keep the day organized.
        </p>
      )}
    </section>
  );
}
