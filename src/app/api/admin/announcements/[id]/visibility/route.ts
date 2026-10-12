// POST /api/admin/announcements/{id}/visibility — 강제 비노출/해제 (openapi.json, ADM-04)
// 게시 상태와 무관하게 공개 노출만 차단한다 (검수 이력은 유지)

import { getAdminUser, jsonError } from "@/lib/auth-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser(request);
  if (!admin) return jsonError(403, "forbidden", "관리자만 사용할 수 있습니다.");

  const { id } = await params;
  const annId = Number(id);
  if (!Number.isInteger(annId) || annId <= 0) return jsonError(400, "invalid_request", "잘못된 요청입니다.");

  const body = await request.json().catch(() => null);
  if (typeof body?.hidden !== "boolean") return jsonError(400, "invalid_request", "hidden 값을 지정해 주세요.");

  const db = createAdminClient();
  const { data, error } = await db
    .from("announcements")
    .update({ hidden: body.hidden })
    .eq("id", annId)
    .select("id");
  if (error) return jsonError(500, "server_error", "처리에 실패했습니다.");
  if (!data || data.length === 0) return jsonError(404, "not_found", "공고를 찾을 수 없습니다.");

  return Response.json({ id: annId, hidden: body.hidden });
}
