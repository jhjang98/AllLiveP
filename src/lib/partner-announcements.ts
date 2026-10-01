import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isValidDate, kstToday } from "@/lib/kst";

// 기관회원 공고 작성 페이로드 검증 (등록·수정 공용)
export interface AnnouncementPayload {
  title: string;
  protocolNo: string | null;
  sponsorName: string | null;
  clinicalStepId: number | null;
  indicationCodeIds: number[];
  target: "patient" | "healthy" | "all";
  gender: "female" | "male" | "any";
  ageMin: number;
  ageMax: number;
  targetCount: number | null;
  recruitStart: string;
  recruitEnd: string;
  participationText: string | null;
  body: string;
  readingPeriodMonths: number;
  sensitiveConsentRequired: boolean;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parsePayload(body: any): { payload?: AnnouncementPayload; error?: string } {
  const title = String(body?.title ?? "").trim();
  if (title.length < 5) return { error: "공고 제목을 5자 이상 입력해 주세요." };

  const target = body?.target;
  if (!["patient", "healthy", "all"].includes(target)) return { error: "모집 대상을 선택해 주세요." };
  const gender = body?.gender;
  if (!["female", "male", "any"].includes(gender)) return { error: "모집 성별을 선택해 주세요." };

  const ageMin = Number(body?.ageMin);
  const ageMax = Number(body?.ageMax);
  if (!Number.isInteger(ageMin) || !Number.isInteger(ageMax) || ageMin < 0 || ageMax > 120 || ageMin > ageMax)
    return { error: "모집 연령 범위를 확인해 주세요." };

  const recruitStart = String(body?.recruitStart ?? "");
  const recruitEnd = String(body?.recruitEnd ?? "");
  if (!isValidDate(recruitStart) || !isValidDate(recruitEnd) || recruitStart > recruitEnd)
    return { error: "모집 기간을 확인해 주세요." };

  const indicationCodeIds = Array.isArray(body?.indicationCodeIds)
    ? body.indicationCodeIds.map(Number).filter((n: number) => Number.isInteger(n) && n > 0)
    : [];
  if (indicationCodeIds.length < 1 || indicationCodeIds.length > 3)
    return { error: "적응증(관심분야)을 1~3개 선택해 주세요." };

  const bodyText = String(body?.body ?? "").trim();
  if (bodyText.length < 20) return { error: "시험 설명을 20자 이상 입력해 주세요." };

  const readingPeriodMonths = Number(body?.readingPeriodMonths ?? 36);
  if (![36, 60, 120].includes(readingPeriodMonths)) return { error: "열람가능기간을 선택해 주세요." };

  const targetCountRaw = body?.targetCount;
  const targetCount =
    targetCountRaw === null || targetCountRaw === undefined || targetCountRaw === ""
      ? null
      : Number(targetCountRaw);
  if (targetCount !== null && (!Number.isInteger(targetCount) || targetCount <= 0))
    return { error: "목표 인원을 확인해 주세요." };

  const clinicalStepRaw = body?.clinicalStepId;
  const clinicalStepId =
    clinicalStepRaw === null || clinicalStepRaw === undefined || clinicalStepRaw === ""
      ? null
      : Number(clinicalStepRaw);
  if (clinicalStepId !== null && (!Number.isInteger(clinicalStepId) || clinicalStepId <= 0))
    return { error: "임상 단계를 확인해 주세요." };

  return {
    payload: {
      title,
      protocolNo: String(body?.protocolNo ?? "").trim() || null,
      sponsorName: String(body?.sponsorName ?? "").trim() || null,
      clinicalStepId,
      indicationCodeIds,
      target,
      gender,
      ageMin,
      ageMax,
      targetCount,
      recruitStart,
      recruitEnd,
      participationText: String(body?.participationText ?? "").trim() || null,
      body: bodyText,
      readingPeriodMonths,
      sensitiveConsentRequired: body?.sensitiveConsentRequired === true,
    },
  };
}

export function toRow(p: AnnouncementPayload) {
  return {
    title: p.title,
    protocol_no: p.protocolNo,
    sponsor_name: p.sponsorName,
    clinical_step_id: p.clinicalStepId,
    target: p.target,
    gender: p.gender,
    age_min: p.ageMin,
    age_max: p.ageMax,
    target_count: p.targetCount,
    recruit_start: p.recruitStart,
    recruit_end: p.recruitEnd,
    participation_text: p.participationText,
    body: p.body,
    reading_period_months: p.readingPeriodMonths,
    sensitive_consent_required: p.sensitiveConsentRequired,
    updated_at: new Date().toISOString(),
  };
}

// 제출 시 추가 검증: 종료일이 오늘 이전이면 제출 불가
export function submittable(recruitEnd: string): boolean {
  return recruitEnd >= kstToday();
}

// 사용자가 속한 승인 기관 id 목록 (복수 소속 대비)
export async function approvedInstitutionIds(userId: string): Promise<number[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("institution_members")
    .select("institution_id, institutions ( status )")
    .eq("profile_id", userId);
  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((m: any) => m.institutions?.status === "approved")
    .map((m) => m.institution_id);
}

// 소유 확인: 이 사용자가 이 공고의 기관 담당자인가 (approved 기관)
export async function getOwnedAnnouncement(userId: string, announcementId: number) {
  const instIds = await approvedInstitutionIds(userId);
  if (instIds.length === 0) return { error: "institution" as const };

  const db = createAdminClient();
  const { data: ann } = await db
    .from("announcements")
    .select("*")
    .eq("id", announcementId)
    .in("institution_id", instIds)
    .maybeSingle();
  if (!ann) return { error: "not_found" as const };
  return { announcement: ann, institutionId: ann.institution_id as number };
}

export async function getApprovedInstitutionId(userId: string): Promise<number | null> {
  const instIds = await approvedInstitutionIds(userId);
  return instIds[0] ?? null; // v1: 기관당 담당자 1계정 — 복수 소속이면 첫 기관
}

// 적응증 코드 검증: 전부 활성 interest 코드여야 한다
export async function validIndicationIds(codeIds: number[]): Promise<boolean> {
  const db = createAdminClient();
  const { count } = await db
    .from("codes")
    .select("id", { count: "exact", head: true })
    .in("id", codeIds)
    .eq("type", "interest")
    .eq("active", true);
  return (count ?? 0) === codeIds.length;
}

export async function validClinicalStepId(id: number | null): Promise<boolean> {
  if (id === null) return true;
  const db = createAdminClient();
  const { count } = await db
    .from("codes")
    .select("id", { count: "exact", head: true })
    .eq("id", id)
    .eq("type", "clinical_step")
    .eq("active", true);
  return (count ?? 0) === 1;
}

// 적응증 교체 — 삭제→삽입 대신 "추가 후 잔여 삭제"로, 실패해도 0개가 되지 않게 한다
export async function replaceIndications(announcementId: number, codeIds: number[]) {
  const db = createAdminClient();
  const { error: upErr } = await db
    .from("announcement_indications")
    .upsert(codeIds.map((code_id) => ({ announcement_id: announcementId, code_id })), {
      onConflict: "announcement_id,code_id",
      ignoreDuplicates: true,
    });
  if (upErr) return upErr;
  const { error: delErr } = await db
    .from("announcement_indications")
    .delete()
    .eq("announcement_id", announcementId)
    .not("code_id", "in", `(${codeIds.join(",")})`);
  return delErr;
}
