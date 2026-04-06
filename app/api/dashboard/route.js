import { jsonResponse, optionsResponse } from "../../../lib/api-response";
import { getAttendanceAlert } from "../../../lib/attendance-alert";
import { getCatchUp } from "../../../lib/catch-up";
import { getTodayOverview } from "../../../lib/dashboard-overview";
import { logServerError } from "../../../lib/server-logging";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const [todayOverview, attendanceAlert, catchUp] = await Promise.all([
      getTodayOverview(),
      getAttendanceAlert(),
      getCatchUp(),
    ]);

    return jsonResponse(request, {
      todayOverview,
      attendanceAlert,
      catchUp,
    });
  } catch (error) {
    logServerError("Unable to build dashboard payload.", error);

    return jsonResponse(
      request,
      { error: "Unable to load dashboard data right now." },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request) {
  return optionsResponse(request);
}
