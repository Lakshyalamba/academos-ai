import Link from "next/link";
import ChatClient from "./ChatClient";
import styles from "./chat.module.css";
import { getRuntimeStatus } from "../../lib/runtime-status";

export default function ChatPage() {
  const runtimeStatus = getRuntimeStatus();

  return (
    <main className="page-shell">
      <section className={styles.header}>
        <p className="eyebrow">Chat</p>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Academic Reasoning</h1>
            <p className="page-copy">
              The backend fetches Newton data from the local Newton MCP server,
              optionally stores it in Supabase, and sends the academic snapshot
              to Gemini for JSON-only reasoning.
            </p>
          </div>

          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </section>

      <ChatClient initialSetupStatus={runtimeStatus} />
    </main>
  );
}
