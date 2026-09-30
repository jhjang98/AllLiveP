// 로그인/본인확인 후 돌아갈 경로 검증 (오픈 리다이렉트 차단 — 내부 경로만 허용)
export function safeNext(raw: string | null | undefined): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}
