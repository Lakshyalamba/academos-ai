import Link from "next/link";
import ChatClient from "./ChatClient";
import styles from "./chat.module.css";

export default function ChatPage() {
  return (
    <main className="page-shell">
      <section className={styles.header}>
        <p className="eyebrow">Chat</p>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Academic Reasoning</h1>
            <p className="page-copy">
              The backend fetches Newton MCP data, stores it in Supabase, and
              sends the stored record to Claude for JSON-only reasoning.
            </p>
          </div>

          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </section>

      <ChatClient />
    </main>
  );
}
