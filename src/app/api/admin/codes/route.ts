// POST /api/admin/codes — 코드 추가 (ADM-07)

import { getAdminUser, jsonError } from "@/lib/auth-user";
import { createAdminClient } from "@/lib/supabase/admin";

const TYPES = ["indication", "clinical_step", "interest", "not_selected_reason"];

export async function POST(request: Request) {
  const admin = await getAdminUser(request);
  if (!admin) return jsonError(403, "forbidden", "관리자만 사용할 수 있습니다.");

  const body = await request.json().catch(() => null);
  const type = body?.type;
  const name = String(body?.name ?? "").trim();
  const sort = Number(body?.sort ?? 0);
  if (!TYPES.includes(type)) return jsonError(400, "invalid_type", "코드 유형이 올바르지 않습니다.");
  if (name.length < 1) return jsonError(400, "invalid_name", "코드 이름을 입력해 주세요.");
  if (!Number.isInteger(sort)) return jsonError(400, "invalid_sort", "정렬 값을 확인해 주세요.");

  const db = createAdminClient();
  const { data, error } = await db.from("codes").insert({ type, name, sort }).select("id").single();
  if (error) return jsonError(500, "server_error", "저장에 실패했습니다.");
  return Response.json({ id: data.id }, { status: 201 });
}
