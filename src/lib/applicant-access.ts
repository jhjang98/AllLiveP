import "server-only";

import { approvedInstitutionIds } from "@/lib/partner-announcements";
import { createAdminClient } from "@/lib/supabase/admin";

// 이름 마스킹: 김철수 → 김○○ (목록·로그 공통, AGENTS.md 규칙 9)
export function maskName(name: string | null): string {
  if (!name) return "○○○";
  return name[0] + "○".repeat(Math.max(1, name.length - 1));
}

// 열람기한: recruit_end + reading_period_months (R-P04/REQ-062)
export function readingDeadline(recruitEnd: string, months: number): Date {
  const d = new Date(`${recruitEnd}T23:59:59+09:00`);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function withinReadingPeriod(recruitEnd: string, months: number): boolean {
  return readingDeadline(recruitEnd, months) >= new Date();
}

// 지원 건 소유 확인: 이 사용자의 승인 기관 공고에 달린 지원인가
export async function getOwnedApplication(userId: string, applicationId: number) {
  const instIds = await approvedInstitutionIds(userId);
  if (instIds.length === 0) return { error: "institution" as const };

  const db = createAdminClient();
  const { data: app } = await db
    .from("applications")
    .select(
      `id, status, city, district, applied_at, canceled_at, member_id, not_selected_reason_id,
       consent_sensitive, consent_sensitive_third,
       announcements!inner ( id, title, institution_id, recruit_end, reading_period_months )`,
    )
    .eq("id", applicationId)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ann = (app as any)?.announcements;
  if (!app || !instIds.includes(ann?.institution_id)) return { error: "not_found" as const };
  return { application: app, announcement: ann };
}
