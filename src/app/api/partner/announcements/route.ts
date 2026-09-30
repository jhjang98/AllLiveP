// POST /api/partner/announcements — 공고 생성(draft) — approved 기관만 (E-A02, E-I01)

import { getAuthUser, jsonError } from "@/lib/auth-user";
import {
  getApprovedInstitutionId,
  parsePayload,
  replaceIndications,
  toRow,
  validClinicalStepId,
  validIndicationIds,
} from "@/lib/partner-announcements";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const institutionId = await getApprovedInstitutionId(user.id);
  if (!institutionId) return jsonError(403, "institution_required", "승인된 기관 계정만 공고를 등록할 수 있습니다.");

  const body = await request.json().catch(() => null);
  const { payload, error } = parsePayload(body);
  if (!payload) return jsonError(400, "invalid_payload", error ?? "입력을 확인해 주세요.");
  if (!(await validIndicationIds(payload.indicationCodeIds)))
    return jsonError(400, "invalid_payload", "적응증 선택이 올바르지 않습니다.");
  if (!(await validClinicalStepId(payload.clinicalStepId)))
    return jsonError(400, "invalid_payload", "임상 단계 선택이 올바르지 않습니다.");

  const db = createAdminClient();
  const { data, error: insErr } = await db
    .from("announcements")
    .insert({ ...toRow(payload), institution_id: institutionId, created_by: user.id, status: "draft" })
    .select("id")
    .single();
  if (insErr) return jsonError(500, "server_error", "저장에 실패했습니다.");

  const indErr = await replaceIndications(data.id, payload.indicationCodeIds);
  if (indErr) {
    await db.from("announcements").delete().eq("id", data.id);
    return jsonError(500, "server_error", "저장에 실패했습니다.");
  }

  return Response.json({ id: data.id, status: "draft" }, { status: 201 });
}
