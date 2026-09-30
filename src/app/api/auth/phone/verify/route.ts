// POST /api/auth/phone/verify — 인증번호 확인 → 프로필에 본인정보 확정 (openapi.json)
// E-M02: 동일 실명+연락처로 이미 확인된 계정이 있으면 409

import { createHash } from "node:crypto";
import { getAuthUser, jsonError } from "@/lib/auth-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const body = await request.json().catch(() => null);
  const phone = String(body?.phone ?? "").replaceAll("-", "");
  const code = String(body?.code ?? "");
  const name = String(body?.name ?? "").trim();
  const gender = body?.gender;
  const birthDate = String(body?.birthDate ?? "");

  if (!phone || !/^\d{6}$/.test(code)) return jsonError(400, "invalid_code", "인증번호를 확인해 주세요.");
  if (name.length < 2) return jsonError(400, "invalid_name", "이름을 입력해 주세요.");
  if (gender !== "female" && gender !== "male") return jsonError(400, "invalid_gender", "성별을 선택해 주세요.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return jsonError(400, "invalid_birth", "생년월일을 확인해 주세요.");

  const db = createAdminClient();

  // 최근 발급된 미사용·미만료 인증번호와 대조
  const { data: rows } = await db
    .from("phone_verifications")
    .select("id, code_hash, expires_at, verified_at")
    .eq("phone", phone)
    .eq("purpose", "verify")
    .order("created_at", { ascending: false })
    .limit(1);
  const v = rows?.[0];
  const hash = createHash("sha256").update(code).digest("hex");
  if (!v || v.verified_at || new Date(v.expires_at) < new Date() || v.code_hash !== hash) {
    return jsonError(400, "code_mismatch", "인증번호가 올바르지 않거나 만료되었습니다.");
  }

  // E-M02: 동일 휴대폰으로 이미 본인확인된 다른 계정
  const { data: dup } = await db
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .not("phone_verified_at", "is", null)
    .neq("id", user.id)
    .limit(1);
  if (dup && dup.length > 0) {
    return jsonError(409, "duplicate_identity", "이미 이 휴대폰으로 확인된 계정이 있습니다. 기존 계정으로 로그인해 주세요.");
  }

  const now = new Date().toISOString();
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    db.from("phone_verifications").update({ verified_at: now }).eq("id", v.id),
    db
      .from("profiles")
      .update({ name, phone, gender, birth_date: birthDate, phone_verified_at: now })
      .eq("id", user.id),
  ]);
  if (e1 || e2) return jsonError(500, "server_error", "본인확인 처리에 실패했습니다.");

  return Response.json({ verified: true });
}
