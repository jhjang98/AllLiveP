// POST /api/auth/phone/verify — 인증번호 확인 → 프로필에 본인정보 확정 (openapi.json)
// E-M02: 동일 연락처로 이미 확인된 계정이 있으면 409. 시도 5회 초과 시 코드 무효.

import { createHash } from "node:crypto";
import { getAuthUser, jsonError } from "@/lib/auth-user";
import { kstToday } from "@/lib/kst";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_ATTEMPTS = 5;

function isValidBirthDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return false;
  return y >= 1900 && s <= kstToday(); // 미래·비상식 연도 차단
}

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
  if (!isValidBirthDate(birthDate)) return jsonError(400, "invalid_birth", "생년월일을 확인해 주세요.");

  const db = createAdminClient();

  // 최근 발급된 미사용·미만료 인증번호와 대조
  const { data: rows } = await db
    .from("phone_verifications")
    .select("id, code_hash, expires_at, verified_at, attempts")
    .eq("phone", phone)
    .eq("purpose", "verify")
    .order("created_at", { ascending: false })
    .limit(1);
  const v = rows?.[0];
  if (!v || v.verified_at || new Date(v.expires_at) < new Date()) {
    return jsonError(400, "code_mismatch", "인증번호가 올바르지 않거나 만료되었습니다.");
  }
  if (v.attempts >= MAX_ATTEMPTS) {
    return jsonError(429, "too_many_attempts", "시도 횟수를 초과했습니다. 인증번호를 다시 받아주세요.");
  }
  const hash = createHash("sha256").update(code).digest("hex");
  if (v.code_hash !== hash) {
    await db.from("phone_verifications").update({ attempts: v.attempts + 1 }).eq("id", v.id);
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

  // 프로필 확정이 성공한 경우에만 인증번호를 소진 처리한다
  const now = new Date().toISOString();
  const { error: profileError } = await db
    .from("profiles")
    .update({ name, phone, gender, birth_date: birthDate, phone_verified_at: now })
    .eq("id", user.id);
  if (profileError) {
    if (profileError.code === "23505")
      return jsonError(409, "duplicate_identity", "이미 이 휴대폰으로 확인된 계정이 있습니다.");
    return jsonError(500, "server_error", "본인확인 처리에 실패했습니다.");
  }
  await db.from("phone_verifications").update({ verified_at: now }).eq("id", v.id);

  return Response.json({ verified: true });
}
