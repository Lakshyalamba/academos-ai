import { getContestPageData } from "../../../lib/contest-history";

export const runtime = "nodejs";

export async function GET() {
  const contestPageData = await getContestPageData();

  return Response.json(contestPageData, {
    status: contestPageData.status.available ? 200 : 503,
  });
}
