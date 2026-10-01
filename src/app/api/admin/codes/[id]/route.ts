// PATCH /api/admin/codes/{id} — 코드 이름·정렬·활성 변경 (삭제는 없음 — 참조 보전, 비활성으로 대체)

import { getAdminUser, jsonError } from "@/lib/auth-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser(request);
  if (!admin) return jsonError(403, "forbidden", "관리자만 사용할 수 있습니다.");

  const { id } = await params;
  const codeId = Number(id);
  if (!Number.isInteger(codeId) || codeId <= 0) return jsonError(400, "invalid_request", "잘못된 요청입니다.");

  const body = await request.json().catch(() => null);
  const patch: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body?.sort === "number" && Number.isInteger(body.sort)) patch.sort = body.sort;
  if (typeof body?.active === "boolean") patch.active = body.active;
  if (Object.keys(patch).length === 0) return jsonError(400, "empty_patch", "변경할 내용이 없습니다.");

  const db = createAdminClient();
  const { data, error } = await db.from("codes").update(patch).eq("id", codeId).select("id");
  if (error) return jsonError(500, "server_error", "저장에 실패했습니다.");
  if (!data || data.length === 0) return jsonError(404, "not_found", "코드를 찾을 수 없습니다.");
  return Response.json({ id: codeId });
}
