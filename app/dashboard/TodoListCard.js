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
    <section className={styles.todoPanel} aria-label="Personal to-do list">
      <div className={styles.todoPanelHeader}>
        <div>
          <p className={styles.cardLabel}>To-Do List</p>
          <h2 className={styles.todoPanelTitle}>Keep your own study checklist</h2>
          <p className={styles.todoPanelDescription}>
            Add personal tasks and tick them off as you finish them.
          </p>
        </div>
        <p className={styles.todoPanelMeta}>Personal list</p>
      </div>

      <form className={styles.todoForm} onSubmit={handleSubmit}>
        <label className={styles.todoInputLabel} htmlFor="dashboard-todo-input">
          Add a task
        </label>
        <div className={styles.todoInputRow}>
          <input
            id="dashboard-todo-input"
            className={styles.todoInput}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Example: Finish DBMS notes"
            maxLength={120}
          />
          <button className={styles.todoAddButton} type="submit">
            Add
          </button>
        </div>
      </form>

      {items.length > 0 ? (
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
        <p className={styles.todoEmptyState}>
          Add a task to keep track of your own priorities for today.
        </p>
      )}
    </section>
  );
}
