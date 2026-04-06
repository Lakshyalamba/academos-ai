import { jsonResponse, optionsResponse } from "../../../lib/api-response";
import { getAttendanceAlert } from "../../../lib/attendance-alert";
import { getCatchUp } from "../../../lib/catch-up";
import { getTodayOverview } from "../../../lib/dashboard-overview";
import { getRuntimeStatus } from "../../../lib/runtime-status";
import { logServerError } from "../../../lib/server-logging";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const runtimeStatus = getRuntimeStatus();
    const liveAcademicSyncAvailable = Boolean(
      runtimeStatus?.config?.liveAcademicSyncAvailable,
    );
    const [todayOverview, attendanceAlert, catchUp] = await Promise.all([
      getTodayOverview({ enabled: liveAcademicSyncAvailable }),
      getAttendanceAlert({ enabled: liveAcademicSyncAvailable }),
      getCatchUp({ enabled: liveAcademicSyncAvailable }),
    ]);

    return jsonResponse(request, {
      mode: runtimeStatus.mode,
      notice: liveAcademicSyncAvailable ? "" : runtimeStatus.message,
      runtimeStatus,
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
