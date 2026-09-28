// PR #1 참조 구현용 목업 데이터.
// 타입은 supabase/migrations/0001_init.sql 의 announcements 스키마와 정렬한다.
// PR #3에서 Supabase 실데이터로 교체 예정.

export type TargetType = "patient" | "healthy" | "all";
export type GenderType = "female" | "male" | "any";
export type AnnouncementStatus = "approved" | "closed";

export interface Announcement {
  id: number;
  title: string;
  institutionName: string;
  city: string;
  district: string;
  indications: string[];
  target: TargetType;
  gender: GenderType;
  ageMin: number;
  ageMax: number;
  targetCount: number | null;
  recruitStart: string; // ISO date
  recruitEnd: string;
  participationText: string;
  body: string;
  sponsorName: string | null;
  status: AnnouncementStatus;
}

export const targetLabel: Record<TargetType, string> = {
  patient: "질환자",
  healthy: "건강인",
  all: "질환자·건강인",
};

export const genderLabel: Record<GenderType, string> = {
  female: "여성",
  male: "남성",
  any: "성별무관",
};

export function dDay(recruitEnd: string): number {
  const end = new Date(`${recruitEnd}T23:59:59+09:00`).getTime();
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

export function isRecruiting(a: Announcement): boolean {
  return a.status === "approved" && dDay(a.recruitEnd) > 0;
}

export const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "제2형 당뇨병 환자 대상 경구용 치료제 유효성 평가",
    institutionName: "한빛대학교병원",
    city: "서울특별시",
    district: "종로구",
    indications: ["내분비", "당뇨병"],
    target: "patient",
    gender: "any",
    ageMin: 19,
    ageMax: 65,
    targetCount: 30,
    recruitStart: "2026-10-01",
    recruitEnd: "2026-12-31",
    participationText: "외래 방문 4회 (약 8주)",
    body: "경구용 혈당강하제의 유효성과 안전성을 평가하는 시험입니다. 참여 전 담당자가 선정 기준을 자세히 안내해 드립니다.",
    sponsorName: "가상제약",
    status: "approved",
  },
  {
    id: 2,
    title: "건강한 성인 대상 생물학적 동등성 시험 (1박 2일 × 2회)",
    institutionName: "서린병원 임상시험센터",
    city: "경기도",
    district: "수원시",
    indications: ["건강인"],
    target: "healthy",
    gender: "male",
    ageMin: 19,
    ageMax: 45,
    targetCount: 24,
    recruitStart: "2026-09-20",
    recruitEnd: "2026-10-25",
    participationText: "1박 2일 입원 2회",
    body: "제네릭 의약품의 생물학적 동등성을 확인하는 시험입니다.",
    sponsorName: null,
    status: "approved",
  },
  {
    id: 3,
    title: "당뇨 전단계 성인 대상 식이 보조 연구",
    institutionName: "미래의료원",
    city: "서울특별시",
    district: "강남구",
    indications: ["내분비"],
    target: "all",
    gender: "any",
    ageMin: 30,
    ageMax: 70,
    targetCount: null,
    recruitStart: "2026-07-01",
    recruitEnd: "2026-09-15",
    participationText: "외래 2회",
    body: "식이 보조 요법의 효과를 관찰하는 연구입니다.",
    sponsorName: null,
    status: "closed",
  },
];

export function getMockAnnouncement(id: number): Announcement | undefined {
  return mockAnnouncements.find((a) => a.id === id);
}
