import Link from "next/link";

const routes = [
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Check system readiness and the live academic data policy.",
  },
  {
    href: "/chat",
    title: "Chat",
    description: "Run Newton MCP-backed academic reasoning through Gemini, with optional Supabase persistence.",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Academic Data Pipeline</p>
        <h1>Academos</h1>
        <p className="hero-copy">
          Newton data is fetched from the local Newton MCP server, optionally
          stored in Supabase, and sent to Gemini for JSON-only reasoning in the
          UI.
        </p>
      </section>

      <section className="card-grid" aria-label="Primary navigation">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} className="nav-card">
            <span className="nav-card-title">{route.title}</span>
            <span className="nav-card-copy">{route.description}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
