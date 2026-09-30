// POST /api/admin/announcements/{id}/review — 공고 검수 승인/반려 (REQ-031/031a)
// 관리자 전용. 결과는 기관 담당자에게 이메일 통지.

import { getAuthUser, jsonError } from "@/lib/auth-user";
import { notifyEmail } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const db = createAdminClient();
  const { data: me } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return jsonError(403, "forbidden", "관리자만 사용할 수 있습니다.");

  const { id } = await params;
  const annId = Number(id);
  if (!Number.isInteger(annId) || annId <= 0) return jsonError(400, "invalid_request", "잘못된 요청입니다.");

  const body = await request.json().catch(() => null);
  const action = body?.action;
  const reason = String(body?.reason ?? "").trim();
  if (action !== "approve" && action !== "reject")
    return jsonError(400, "invalid_action", "잘못된 처리 유형입니다.");
  if (action === "reject" && !reason) return jsonError(400, "reason_required", "반려 사유를 입력해 주세요.");

  const { data: ann } = await db
    .from("announcements")
    .select("id, title, status, created_by")
    .eq("id", annId)
    .maybeSingle();
  if (!ann) return jsonError(404, "not_found", "공고를 찾을 수 없습니다.");
  if (ann.status !== "pending_review")
    return jsonError(409, "invalid_state", "검수 대기 상태의 공고만 처리할 수 있습니다.");

  const to = action === "approve" ? "approved" : "rejected";
  const { data: updated, error } = await db
    .from("announcements")
    .update({
      status: to,
      reject_reason: action === "reject" ? reason : null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", annId)
    .eq("status", "pending_review")
    .select("id");
  if (error) return jsonError(500, "server_error", "처리에 실패했습니다.");
  if (!updated || updated.length === 0)
    return jsonError(409, "invalid_state", "다른 관리자가 이미 처리했습니다.");

  const { data: creator } = await db.auth.admin.getUserById(ann.created_by);
  if (creator.user?.email) {
    await notifyEmail(creator.user.email, `announcement_${to}`, {
      announcementId: annId,
      title: ann.title,
      reason: action === "reject" ? reason : null,
    });
  }

  return Response.json({ id: annId, status: to });
}
