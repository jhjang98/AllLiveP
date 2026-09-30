// PATCH /api/partner/announcements/{id} — 공고 수정
// draft/rejected/pending_review: 자유 수정 (pending_review는 검수 대기 유지)
// approved: 수정하면 pending_review로 복귀하고 공개 목록에서 내려간다 (v1 단순화 — docs/domain/announcement.md)
// closed: 수정 불가

import { getAuthUser, jsonError } from "@/lib/auth-user";
import {
  getOwnedAnnouncement,
  parsePayload,
  replaceIndications,
  toRow,
} from "@/lib/partner-announcements";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const { id } = await params;
  const owned = await getOwnedAnnouncement(user.id, Number(id));
  if (owned.error === "institution")
    return jsonError(403, "institution_required", "승인된 기관 계정만 사용할 수 있습니다.");
  if (owned.error === "not_found") return jsonError(404, "not_found", "공고를 찾을 수 없습니다.");
  const ann = owned.announcement;

  if (ann.status === "closed") return jsonError(409, "closed", "마감된 공고는 수정할 수 없습니다.");

  const body = await request.json().catch(() => null);
  const { payload, error } = parsePayload(body);
  if (!payload) return jsonError(400, "invalid_payload", error ?? "입력을 확인해 주세요.");

  const reReview = ann.status === "approved";
  const db = createAdminClient();
  const { data: updated, error: upErr } = await db
    .from("announcements")
    .update({
      ...toRow(payload),
      ...(reReview ? { status: "pending_review", reviewed_by: null, reviewed_at: null } : {}),
    })
    .eq("id", ann.id)
    .eq("status", ann.status) // 검수와의 경합 방지
    .select("id");
  if (upErr) return jsonError(500, "server_error", "저장에 실패했습니다.");
  if (!updated || updated.length === 0)
    return jsonError(409, "state_changed", "상태가 변경되었습니다. 새로고침 후 다시 시도해 주세요.");

  const indErr = await replaceIndications(ann.id, payload.indicationCodeIds);
  if (indErr) return jsonError(500, "server_error", "적응증 저장에 실패했습니다.");

  return Response.json({
    id: ann.id,
    status: reReview ? "pending_review" : ann.status,
    reReview,
  });
}
