import "server-only";

import { createClient } from "@supabase/supabase-js";

// service-role 클라이언트 — RLS를 우회하므로 Route Handler의 검증 로직 뒤에서만 사용한다.
// (AGENTS.md 규칙 2·3: 업무규칙 쓰기·개인정보 접근 전용)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 서버 환경변수가 없습니다");
  return createClient(url, key, { auth: { persistSession: false } });
}
