// 한국시간 기준 날짜·나이 계산 (레거시 정책: 만 나이, 1일 1회 제한은 KST 기준)

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function kstToday(): string {
  return new Date(Date.now() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

// KST 오늘 00:00를 UTC ISO로 반환 (applied_at >= 이 값 → 오늘 지원한 건)
export function kstDayStartUtc(): string {
  const today = kstToday();
  return new Date(new Date(`${today}T00:00:00+09:00`).getTime()).toISOString();
}

// 달력상 실제 존재하는 날짜인지 (YYYY-MM-DD)
export function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

// 만 나이 (R-M02)
export function koreanAge(birthDate: string): number {
  const today = kstToday();
  const [ty, tm, td] = today.split("-").map(Number);
  const [by, bm, bd] = birthDate.split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  return age;
}
