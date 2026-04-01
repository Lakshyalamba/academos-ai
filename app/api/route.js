import { getRuntimeStatus } from "../../lib/runtime-status";

export async function GET() {
  return Response.json(getRuntimeStatus());
}
