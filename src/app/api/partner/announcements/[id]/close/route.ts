// POST /api/partner/announcements/{id}/close — 조기마감 (approved → closed, REQ-030)

import { getAuthUser, jsonError } from "@/lib/auth-user";
import { getOwnedAnnouncement } from "@/lib/partner-announcements";
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

  if (ann.status !== "approved") return jsonError(409, "invalid_state", "게시 중인 공고만 마감할 수 있습니다.");

  const db = createAdminClient();
  const { data: updated, error } = await db
    .from("announcements")
    .update({ status: "closed", early_closed_at: new Date().toISOString() })
    .eq("id", ann.id)
    .eq("status", "approved")
    .select("id");
  if (error) return jsonError(500, "server_error", "마감 처리에 실패했습니다.");
  if (!updated || updated.length === 0)
    return jsonError(409, "state_changed", "상태가 변경되었습니다. 새로고침 후 확인해 주세요.");

  return Response.json({ id: ann.id, status: "closed" });
}
