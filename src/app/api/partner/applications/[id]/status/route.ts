// POST /api/partner/applications/{id}/status — 지원자 상태 변경 (docs/domain/application.md)
// in_progress: viewed에서 / selected·not_selected: viewed|in_progress에서 (미선정은 사유 필수)

import { getAuthUser, jsonError } from "@/lib/auth-user";
import { getOwnedApplication, withinReadingPeriod } from "@/lib/applicant-access";
import { notifyEmail } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";

const TRANSITIONS: Record<string, string[]> = {
  in_progress: ["viewed"],
  selected: ["viewed", "in_progress"],
  not_selected: ["viewed", "in_progress"],
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const { id } = await params;
  const appId = Number(id);
  if (!Number.isInteger(appId) || appId <= 0) return jsonError(400, "invalid_request", "잘못된 요청입니다.");

  const owned = await getOwnedApplication(user.id, appId);
  if (owned.error === "institution")
    return jsonError(403, "institution_required", "승인된 기관 계정만 사용할 수 있습니다.");
  if (owned.error === "not_found") return jsonError(404, "not_found", "지원 내역을 찾을 수 없습니다.");
  const { application: app, announcement: ann } = owned;

  if (!withinReadingPeriod(ann.recruit_end, ann.reading_period_months))
    return jsonError(403, "reading_period_over", "열람 기간이 종료되었습니다.");

  const body = await request.json().catch(() => null);
  const to = body?.status;
  if (typeof to !== "string" || !Object.hasOwn(TRANSITIONS, to))
    return jsonError(400, "invalid_status", "잘못된 상태입니다.");
  if (!TRANSITIONS[to].includes(app.status)) {
    if (app.status === "applied")
      return jsonError(409, "view_first", "지원자 정보를 먼저 열람한 뒤 상태를 변경할 수 있습니다.");
    return jsonError(409, "invalid_state", "현재 상태에서는 변경할 수 없습니다.");
  }

  const db = createAdminClient();

  let reasonCodeId: number | null = null;
  if (to === "not_selected") {
    reasonCodeId = Number(body?.reasonCodeId);
    if (!Number.isInteger(reasonCodeId) || reasonCodeId <= 0)
      return jsonError(400, "reason_required", "미선정 사유를 선택해 주세요.");
    const { count } = await db
      .from("codes")
      .select("id", { count: "exact", head: true })
      .eq("id", reasonCodeId)
      .eq("type", "not_selected_reason")
      .eq("active", true);
    if ((count ?? 0) !== 1) return jsonError(400, "reason_required", "미선정 사유가 올바르지 않습니다.");
  }

  const { data: updated, error } = await db
    .from("applications")
    .update({ status: to, not_selected_reason_id: reasonCodeId })
    .eq("id", appId)
    .eq("status", app.status) // 동시 변경 방지
    .select("id");
  if (error) return jsonError(500, "server_error", "상태 변경에 실패했습니다.");
  if (!updated || updated.length === 0)
    return jsonError(409, "state_changed", "상태가 이미 변경되었습니다. 새로고침 후 확인해 주세요.");

  await db.from("application_events").insert({
    application_id: appId,
    actor_id: user.id,
    actor_role: "institution",
    event: "status_change",
    from_status: app.status,
    to_status: to,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
  });

  // 지원자에게 이메일 통지 (REQ-070)
  const { data: memberUser } = await db.auth.admin.getUserById(app.member_id);
  if (memberUser.user?.email) {
    await notifyEmail(memberUser.user.email, `application_status_${to}`, {
      applicationId: appId,
      announcementTitle: ann.title,
    });
  }

  return Response.json({ id: appId, status: to });
}
