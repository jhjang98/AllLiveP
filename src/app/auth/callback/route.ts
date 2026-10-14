// GET /auth/callback — 가입 확인 메일 링크 처리 (PKCE code → 세션 교환 후 next로 이동)
// 메일을 다른 브라우저에서 열면 code 교환이 실패하지만, 인증 자체는 Supabase가 이미 완료했으므로
// 로그인 화면으로 보내 로그인하게 한다.

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
  login.searchParams.set("notice", "confirmed");
  login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}
