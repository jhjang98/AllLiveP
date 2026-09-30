// POST /api/partner/announcements/{id}/submit — 검수 제출 (draft|rejected → pending_review, REQ-030/031)

import { getAuthUser, jsonError } from "@/lib/auth-user";
import { getOwnedAnnouncement, submittable } from "@/lib/partner-announcements";
import { notifyEmail } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const { id } = await params;
  const owned = await getOwnedAnnouncement(user.id, Number(id));
  if (owned.error === "institution")
    return jsonError(403, "institution_required", "승인된 기관 계정만 사용할 수 있습니다.");
  if (owned.error === "not_found") return jsonError(404, "not_found", "공고를 찾을 수 없습니다.");
  const ann = owned.announcement;

  if (!["draft", "rejected"].includes(ann.status))
    return jsonError(409, "invalid_state", "작성 중이거나 반려된 공고만 제출할 수 있습니다.");
  if (!submittable(ann.recruit_end))
    return jsonError(400, "recruit_end_past", "모집 종료일이 지났습니다. 기간을 수정해 주세요.");

  const db = createAdminClient();
  const { data: updated, error } = await db
    .from("announcements")
    .update({ status: "pending_review", reject_reason: null })
    .eq("id", ann.id)
    .eq("status", ann.status)
    .select("id");
  if (error) return jsonError(500, "server_error", "제출에 실패했습니다.");
  if (!updated || updated.length === 0)
    return jsonError(409, "state_changed", "상태가 변경되었습니다. 새로고침 후 다시 시도해 주세요.");

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (adminEmail) {
    await notifyEmail(adminEmail, "announcement_submitted", { announcementId: ann.id, title: ann.title });
  }

  return Response.json({ id: ann.id, status: "pending_review" });
}
