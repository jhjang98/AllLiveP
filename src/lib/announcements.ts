// 공고 조회 계층 (서버 전용)
// RLS: 익명은 approved/closed & not hidden 공고만 읽힌다 (0001_init.sql)

import { createServerSupabase } from "@/lib/supabase/server";
import type { AnnouncementView } from "@/lib/announcement-view";

export * from "@/lib/announcement-view";

const SELECT = `id, title, target, gender, age_min, age_max, target_count,
  recruit_start, recruit_end, participation_text, body, sponsor_name, status, sensitive_consent_required,
  institutions ( name, address ),
  announcement_indications ( codes ( name ) )`;

// Supabase 조인 결과 행 → 화면 타입
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toView(row: any): AnnouncementView {
  return {
    id: row.id,
    title: row.title,
    institutionName: row.institutions?.name ?? "기관 미표시",
    institutionAddress: row.institutions?.address ?? "",
    indications: (row.announcement_indications ?? [])
      .map((x: { codes: { name: string } | null }) => x.codes?.name)
      .filter(Boolean),
    target: row.target,
    gender: row.gender,
    ageMin: row.age_min,
    ageMax: row.age_max,
    targetCount: row.target_count,
    recruitStart: row.recruit_start,
    recruitEnd: row.recruit_end,
    participationText: row.participation_text,
    body: row.body,
    sponsorName: row.sponsor_name,
    status: row.status,
    sensitiveConsentRequired: row.sensitive_consent_required ?? false,
  };
}

export async function listAnnouncements(): Promise<AnnouncementView[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("announcements")
    .select(SELECT)
    .order("recruit_end", { ascending: true });
  if (error) throw new Error(`공고 목록 조회 실패: ${error.message}`);
  return (data ?? []).map(toView);
}

export async function getAnnouncement(id: number): Promise<AnnouncementView | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("announcements").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`공고 조회 실패: ${error.message}`);
  return data ? toView(data) : null;
}
