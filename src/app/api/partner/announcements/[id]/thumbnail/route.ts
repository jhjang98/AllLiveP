// POST /api/partner/announcements/{id}/thumbnail — 공고 썸네일 업로드(교체)
// 정책: 썸네일 교체는 경미 수정으로 재검수 없이 즉시 반영 (부적절 이미지는 관리자 강제 비노출로 대응)
//       — docs/domain/announcement.md "확정 및 기본값" 1항 보완

import { randomUUID } from "node:crypto";
import { getAuthUser, jsonError } from "@/lib/auth-user";
import { getOwnedAnnouncement } from "@/lib/partner-announcements";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const { id } = await params;
  const owned = await getOwnedAnnouncement(user.id, Number(id));
  if (owned.error === "institution")
    return jsonError(403, "institution_required", "승인된 기관 계정만 사용할 수 있습니다.");
  if (owned.error === "not_found") return jsonError(404, "not_found", "공고를 찾을 수 없습니다.");
  const ann = owned.announcement;
  if (ann.status === "closed") return jsonError(409, "closed", "마감된 공고는 수정할 수 없습니다.");

  const form = await request.formData().catch(() => null);
  const file = form?.get("thumbnail");
  if (!(file instanceof File) || file.size === 0)
    return jsonError(400, "file_required", "이미지 파일을 첨부해 주세요.");
  const ext = ALLOWED[file.type];
  if (!ext) return jsonError(400, "file_type", "JPG/PNG/WebP만 업로드할 수 있습니다.");
  if (file.size > MAX_SIZE) return jsonError(400, "file_size", "이미지는 5MB 이하여야 합니다.");

  // 매직바이트 검증 — 선언된 MIME을 신뢰하지 않는다 (리뷰 반영)
  const buf = Buffer.from(await file.arrayBuffer());
  const isPng = buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const isJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isWebp = buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
  if (!((file.type === "image/png" && isPng) || (file.type === "image/jpeg" && isJpg) || (file.type === "image/webp" && isWebp)))
    return jsonError(400, "file_type", "이미지 파일이 아니거나 형식이 올바르지 않습니다.");

  const db = createAdminClient();
  // 참고: 동시 업로드 시 이전 파일 정리가 경합으로 남을 수 있으나(고아 파일) 사용자 영향 없음 — 수용
  const path = `${ann.institution_id}/${ann.id}/${randomUUID()}.${ext}`;
  const { error: upErr } = await db.storage
    .from("thumbs")
    .upload(path, buf, { contentType: file.type });
  if (upErr) return jsonError(500, "upload_failed", "업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");

  const { error } = await db.from("announcements").update({ thumbnail_path: path }).eq("id", ann.id);
  if (error) {
    await db.storage.from("thumbs").remove([path]);
    return jsonError(500, "server_error", "저장에 실패했습니다.");
  }

  // 이전 썸네일 정리 (실패는 기록만)
  if (ann.thumbnail_path && ann.thumbnail_path !== path) {
    const { error: rmErr } = await db.storage.from("thumbs").remove([ann.thumbnail_path]);
    if (rmErr) console.warn(`[thumbs] 이전 썸네일 삭제 실패: ${ann.thumbnail_path}`);
  }

  return Response.json({ id: ann.id, thumbnailPath: path });
}
