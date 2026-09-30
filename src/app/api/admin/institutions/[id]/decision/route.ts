// POST /api/admin/institutions/{id}/decision — 기관 승인/반려/정지/해제 (REQ-022/023)
// 관리자(profiles.role=admin) 전용. 처리 결과는 기관 담당자에게 이메일 통지.

import { getAuthUser, jsonError } from "@/lib/auth-user";
import { notifyEmail } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";

type Action = "approve" | "reject" | "suspend" | "reinstate";

// 상태전이 규칙 (docs/domain/institution.md)
const TRANSITIONS: Record<Action, { from: string[]; to: string; reasonRequired: boolean }> = {
  approve: { from: ["pending"], to: "approved", reasonRequired: false },
  reject: { from: ["pending"], to: "rejected", reasonRequired: true },
  suspend: { from: ["approved"], to: "suspended", reasonRequired: true },
  reinstate: { from: ["suspended"], to: "approved", reasonRequired: false },
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const db = createAdminClient();
  const { data: me } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return jsonError(403, "forbidden", "관리자만 사용할 수 있습니다.");

  const { id } = await params;
  const instId = Number(id);
  if (!Number.isInteger(instId) || instId <= 0) return jsonError(400, "invalid_request", "잘못된 요청입니다.");

  const body = await request.json().catch(() => null);
  const action = body?.action as Action;
  const reason = String(body?.reason ?? "").trim();
  const rule = TRANSITIONS[action];
  if (!rule) return jsonError(400, "invalid_action", "잘못된 처리 유형입니다.");
  if (rule.reasonRequired && !reason) return jsonError(400, "reason_required", "사유를 입력해 주세요.");

  const { data: inst } = await db
    .from("institutions")
    .select("id, name, status")
    .eq("id", instId)
    .maybeSingle();
  if (!inst) return jsonError(404, "not_found", "기관을 찾을 수 없습니다.");
  if (!rule.from.includes(inst.status))
    return jsonError(409, "invalid_state", `현재 상태(${inst.status})에서는 처리할 수 없습니다.`);

  const { error } = await db
    .from("institutions")
    .update({
      status: rule.to,
      status_reason: rule.reasonRequired ? reason : null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", instId)
    .eq("status", inst.status); // 동시 처리 방지
  if (error) return jsonError(500, "server_error", "처리에 실패했습니다.");

  // 기관 담당자에게 통지
  const { data: member } = await db
    .from("institution_members")
    .select("profile_id")
    .eq("institution_id", instId)
    .limit(1)
    .maybeSingle();
  if (member) {
    const { data: owner } = await db.auth.admin.getUserById(member.profile_id);
    if (owner.user?.email) {
      await notifyEmail(owner.user.email, `institution_${rule.to}`, {
        institutionId: instId,
        institutionName: inst.name,
        reason: reason || null,
      });
    }
  }

  return Response.json({ id: instId, status: rule.to });
}
