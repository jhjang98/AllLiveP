// POST /api/auth/phone/request — 본인확인 SMS 인증번호 발송 (openapi.json)
// SMS_MODE=mock: 발송하지 않고 devCode를 응답에 포함(개발 전용). 가비아 실발송은 키 수령 후.

import { createHash, randomInt } from "node:crypto";
import { getAuthUser, jsonError } from "@/lib/auth-user";
import { createAdminClient } from "@/lib/supabase/admin";

const PHONE_RE = /^01[016789]\d{7,8}$/;

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const body = await request.json().catch(() => null);
  const phone = String(body?.phone ?? "").replaceAll("-", "");
  if (!PHONE_RE.test(phone)) return jsonError(400, "invalid_phone", "휴대폰 번호를 확인해 주세요.");

  const db = createAdminClient();

  // 과다 요청 방지: 같은 번호로 10분 내 3회까지
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await db
    .from("phone_verifications")
    .select("id", { count: "exact", head: true })
    .eq("phone", phone)
    .gte("created_at", since);
  if ((count ?? 0) >= 3) return jsonError(429, "too_many_requests", "잠시 후 다시 시도해 주세요.");

  const code = String(randomInt(100000, 1000000));
  const { error } = await db.from("phone_verifications").insert({
    phone,
    code_hash: createHash("sha256").update(code).digest("hex"),
    purpose: "verify",
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
  if (error) return jsonError(500, "server_error", "인증번호 발급에 실패했습니다.");

  // 리뷰 반영: 모의 모드는 명시적 opt-in(SMS_MODE=mock)일 때만. env 누락 = 미설정 오류로 처리
  const mode = process.env.SMS_MODE;
  if (mode === "mock") {
    console.log(`[sms:mock] ${phone} 인증번호 ${code}`);
    return Response.json({ sent: true, devCode: code });
  }
  if (mode !== "live") return jsonError(503, "not_configured", "SMS 발송이 설정되지 않았습니다.");
  // TODO(가비아 키 수령 후): lib/sms.ts 실발송
  return Response.json({ sent: true });
}
