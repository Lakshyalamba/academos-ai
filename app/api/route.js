import { jsonResponse, optionsResponse } from "../../lib/api-response";
import { getRuntimeStatus } from "../../lib/runtime-status";

export const runtime = "nodejs";

export async function GET(request) {
  return jsonResponse(request, getRuntimeStatus());
}

export async function OPTIONS(request) {
  return optionsResponse(request);
}
