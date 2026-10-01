// POST /api/applications/{id}/cancel — 지원 취소 (본인, selected 전까지 — E-P05)

import { clientIp, getAuthUser, jsonError } from "@/lib/auth-user";
import { notifyEmail } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";

const CANCELABLE = ["applied", "viewed", "in_progress"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const { id } = await params;
  const appId = Number(id);
  if (!Number.isInteger(appId) || appId <= 0) return jsonError(400, "invalid_request", "잘못된 요청입니다.");

  const db = createAdminClient();
  const { data: app } = await db
    .from("applications")
    .select("id, member_id, status, announcements ( title )")
    .eq("id", appId)
    .maybeSingle();
  if (!app || app.member_id !== user.id) return jsonError(404, "not_found", "지원 내역을 찾을 수 없습니다.");
  if (app.status === "canceled") return jsonError(409, "already_canceled", "이미 취소된 지원입니다.");
  if (!CANCELABLE.includes(app.status))
    return jsonError(409, "not_cancelable", "선정 완료된 지원은 취소할 수 없습니다. 기관에 문의해 주세요.");

  const now = new Date().toISOString();
  const { error } = await db
    .from("applications")
    .update({ status: "canceled", canceled_at: now })
    .eq("id", appId)
    .eq("member_id", user.id)
    .in("status", CANCELABLE); // 동시성: 조회 후 변경된 상태 방지
  if (error) return jsonError(500, "server_error", "취소 처리에 실패했습니다.");

  const { error: evErr } = await db.from("application_events").insert({
    application_id: appId,
    actor_id: user.id,
    actor_role: "member",
    event: "status_change",
    from_status: app.status,
    to_status: "canceled",
    ip: clientIp(request),
  });
  if (evErr) console.error(`[events] 취소 이력 기록 실패 app=${appId}: ${evErr.message}`);

  if (user.email) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const title = (app as any).announcements?.title ?? "";
    await notifyEmail(user.email, "application_canceled", { applicationId: appId, announcementTitle: title });
  }

  return Response.json({ canceled: true });
}
