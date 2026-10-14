import { NextResponse } from "next/server";
import { safeNext } from "@/lib/nav";
import { createServerSupabase } from "@/lib/supabase/server";

// 폼 필드 next가 있으면 로그아웃 후 그 내부 경로로 이동 (없으면 홈)
export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  const form = await request.formData().catch(() => null);
  const next = safeNext(form?.get("next")?.toString());
  return NextResponse.redirect(new URL(next, request.url), { status: 303 });
}
