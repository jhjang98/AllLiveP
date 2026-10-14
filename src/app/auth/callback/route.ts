// GET /auth/callback — 가입 확인 메일 링크 처리 (PKCE code → 세션 교환 후 next로 이동)
// code 교환 실패(다른 브라우저에서 연 링크, 이미 쓴 링크 등)는 인증 성공 여부를 알 수 없으므로
// 단정하지 않는 안내(verify_check)와 함께 로그인 화면으로 보낸다.

import { NextResponse } from "next/server";
import { safeNext } from "@/lib/nav";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (url.searchParams.get("error")) {
    return NextResponse.redirect(new URL("/login?notice=link_invalid", url.origin));
  }

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }

  const login = new URL("/login", url.origin);
  login.searchParams.set("notice", "verify_check");
  login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}
