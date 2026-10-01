// GET /api/partner/applications/{id} — 지원자 개인정보 열람 (REQ-061/062, E-P04)
// 열람기한 검사 → pii_view 로그(열람자·일시·IP) → 첫 열람 시 applied→viewed 자동 전환

import { clientIp, getAuthUser, jsonError } from "@/lib/auth-user";
import { getOwnedApplication, withinReadingPeriod } from "@/lib/applicant-access";
import { koreanAge } from "@/lib/kst";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  // 취소된 지원은 개인정보를 제공하지 않는다 (리뷰 반영)
  if (app.status === "canceled")
    return jsonError(409, "canceled", "지원자가 취소한 지원 건입니다.");

  if (!withinReadingPeriod(ann.recruit_end, ann.reading_period_months))
    return jsonError(403, "reading_period_over", "열람 기간이 종료되었습니다.");

  const db = createAdminClient();
  const ip = clientIp(request);

  // 개인정보 열람 로그 — 기록에 실패하면 개인정보를 반환하지 않는다 (fail-closed, 컴플라이언스)
  const { error: logErr } = await db.from("application_events").insert({
    application_id: appId,
    actor_id: user.id,
    actor_role: "institution",
    event: "pii_view",
    ip,
  });
  if (logErr) {
    console.error(`[pii_view] 열람 로그 기록 실패 app=${appId}: ${logErr.message}`);
    return jsonError(500, "audit_failed", "열람 기록에 실패하여 열람할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  // 첫 열람: applied → viewed (상태 이력도 남긴다)
  if (app.status === "applied") {
    const { data: moved } = await db
      .from("applications")
      .update({ status: "viewed" })
      .eq("id", appId)
      .eq("status", "applied")
      .select("id");
    if (moved && moved.length > 0) {
      const { error: evErr } = await db.from("application_events").insert({
        application_id: appId,
        actor_id: user.id,
        actor_role: "institution",
        event: "status_change",
        from_status: "applied",
        to_status: "viewed",
        ip,
      });
      if (evErr) console.error(`[events] viewed 전환 이력 기록 실패 app=${appId}: ${evErr.message}`);
      app.status = "viewed";
    }
  }

  const { data: member } = await db
    .from("profiles")
    .select("name, phone, gender, birth_date")
    .eq("id", app.member_id)
    .single();

  return Response.json({
    id: app.id,
    status: app.status,
    appliedAt: app.applied_at,
    region: `${app.city} ${app.district}`,
    consentSensitive: app.consent_sensitive && app.consent_sensitive_third,
    member: member
      ? {
          name: member.name,
          phone: member.phone,
          gender: member.gender,
          birthDate: member.birth_date,
          age: member.birth_date ? koreanAge(member.birth_date) : null,
        }
      : null,
  });
}
