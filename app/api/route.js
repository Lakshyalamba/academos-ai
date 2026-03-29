import { isClaudeConfigured } from "../../lib/claude";
import { isSupabaseConfigured } from "../../lib/supabase";

export async function GET() {
  const claudeConfigured = isClaudeConfigured();
  const supabaseConfigured = isSupabaseConfigured();

  return Response.json({
    status:
      claudeConfigured && supabaseConfigured ? "ok" : "setup-required",
    message:
      claudeConfigured && supabaseConfigured
        ? "Academos API route is ready."
        : "Academos requires Supabase and Claude configuration before academic reasoning can run.",
    config: {
      claudeConfigured,
      supabaseConfigured,
    },
    links: ["/dashboard", "/chat"],
  });
}
