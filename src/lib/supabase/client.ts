"use client";

import { createBrowserClient } from "@supabase/ssr";

// 브라우저 전용 클라이언트. 이벤트 핸들러 안에서 호출한다 (프리렌더 시 env 부재 대비).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
