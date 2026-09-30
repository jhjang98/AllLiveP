// POST /api/applications — 공고 지원 (openapi.json)
// 검증 순서: 로그인 → 본인확인(E-M01) → 공고 존재·모집중(E-P03) → 성별·나이(E-P01/R-P01)
//           → 1일 1회(R-P03) → 중복(E-P02, unique 제약) → 저장 + 이력 + 알림

import { getAuthUser, jsonError } from "@/lib/auth-user";
import { dDay } from "@/lib/announcement-view";
import { koreanAge, kstDayStartUtc } from "@/lib/kst";
import { notifyEmail } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const body = await request.json().catch(() => null);
  const announcementId = Number(body?.announcementId);
  const city = String(body?.city ?? "").trim();
  const district = String(body?.district ?? "").trim();
  if (!Number.isInteger(announcementId) || announcementId <= 0)
    return jsonError(400, "invalid_request", "잘못된 요청입니다.");
  if (!city || !district) return jsonError(400, "invalid_region", "거주 지역을 입력해 주세요.");
  if (body?.consentPrivacy !== true || body?.consentThirdParty !== true)
    return jsonError(400, "consent_required", "필수 동의 항목에 동의해 주세요.");

  const db = createAdminClient();

  // 본인확인 상태 (E-M01)
  const { data: profile } = await db
    .from("profiles")
    .select("name, gender, birth_date, phone_verified_at, withdrawn_at")
    .eq("id", user.id)
    .single();
  if (!profile || profile.withdrawn_at) return jsonError(403, "forbidden", "지원할 수 없는 계정입니다.");
  if (!profile.phone_verified_at || !profile.birth_date || !profile.gender)
    return jsonError(403, "verification_required", "본인확인 후 지원할 수 있습니다.");

  // 공고 상태 (E-P03) — 게시·모집중만
  const { data: ann } = await db
    .from("announcements")
    .select("id, status, hidden, gender, age_min, age_max, recruit_end, title, sensitive_consent_required, institution_id")
    .eq("id", announcementId)
    .maybeSingle();
  if (!ann || ann.hidden || ann.status !== "approved" || dDay(ann.recruit_end) <= 0)
    return jsonError(410, "closed", "모집이 마감되었거나 없는 공고입니다.");

  // 민감정보 동의 (공고 설정 시 필수 — 리뷰 반영)
  if (
    ann.sensitive_consent_required &&
    (body?.consentSensitive !== true || body?.consentSensitiveThird !== true)
  )
    return jsonError(400, "consent_required", "이 공고는 민감정보 수집·제공 동의가 필요합니다.");

  // 모집조건 (E-P01)
  if (ann.gender !== "any" && ann.gender !== profile.gender)
    return jsonError(403, "condition_gender", "모집 성별 조건에 맞지 않습니다.");
  const age = koreanAge(profile.birth_date);
  if (age < ann.age_min || age > ann.age_max)
    return jsonError(403, "condition_age", "모집 연령 조건에 맞지 않습니다.");

  // 1일 1회 (R-P03)
  const { count: todayCount } = await db
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("member_id", user.id)
    .gte("applied_at", kstDayStartUtc());
  if ((todayCount ?? 0) >= 1)
    return jsonError(409, "daily_limit", "지원은 하루에 1건만 할 수 있습니다. 내일 다시 시도해 주세요.");

  // 저장 (중복은 unique 제약으로 차단 — E-P02, 취소 후 재지원 불가 포함)
  const { data: app, error } = await db
    .from("applications")
    .insert({
      announcement_id: announcementId,
      member_id: user.id,
      city,
      district,
      consent_privacy: true,
      consent_third_party: true,
      consent_sensitive: body?.consentSensitive === true,
      consent_sensitive_third: body?.consentSensitiveThird === true,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505")
      return jsonError(409, "duplicate", "이미 지원한 공고입니다. 마이페이지에서 확인해 주세요.");
    return jsonError(500, "server_error", "지원 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }

  await db.from("application_events").insert({
    application_id: app.id,
    actor_id: user.id,
    actor_role: "member",
    event: "submit",
    to_status: "applied",
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
  });

  if (user.email) {
    await notifyEmail(user.email, "application_received", {
      applicationId: app.id,
      announcementTitle: ann.title,
    });
  }

  return Response.json({ id: app.id }, { status: 201 });
}
