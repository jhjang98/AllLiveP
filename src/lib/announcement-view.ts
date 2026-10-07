// 공고 화면 공용 타입·헬퍼 (클라이언트/서버 겸용 — 서버 의존성 금지)

export type TargetType = "patient" | "healthy" | "all";
export type GenderType = "female" | "male" | "any";

export interface AnnouncementView {
  id: number;
  title: string;
  institutionName: string;
  institutionAddress: string;
  indications: string[];
  target: TargetType;
  gender: GenderType;
  ageMin: number;
  ageMax: number;
  targetCount: number | null;
  recruitStart: string;
  recruitEnd: string;
  participationText: string | null;
  body: string;
  sponsorName: string | null;
  status: "approved" | "closed";
  sensitiveConsentRequired: boolean;
  thumbnailUrl: string | null;
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

// R-A01: 모집중 = approved + 종료일 전 (조기마감은 closed로 전환되어 반영됨)
export function isRecruiting(a: Pick<AnnouncementView, "status" | "recruitEnd">): boolean {
  return a.status === "approved" && dDay(a.recruitEnd) > 0;
}
