import Image from "next/image";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

async function getSession(): Promise<{ email: string; role: string } | null> {
  // env 미설정(로컬 초기 세팅 전)에서도 페이지가 뜨도록 방어
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { email: user.email, role: profile?.role ?? "member" };
}

export async function SiteHeader() {
  const session = await getSession();
  return (
    <header className="border-b border-line bg-surface">
      {/* 모바일: 메뉴가 넘치면 로고 아래 줄로 내려가고, 그래도 넘치면 가로 스크롤 */}
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
        <Link href="/" className="flex items-center">
          {/* 4배율 에셋(478x160)을 재압축 없이 서빙 — 표시 높이 40px (원본: assets/brand/logo-original.png) */}
          <Image
            src="/logo.png"
            alt="AllLiveP — We Connect Health"
            width={478}
            height={160}
            className="h-10 w-auto"
            priority
            unoptimized
          />
        </Link>
        <nav className="flex max-w-full items-center gap-4 overflow-x-auto text-[15px] whitespace-nowrap text-muted sm:gap-5">
          <Link href="/trials" className="hover:text-ink">
            공고 찾기
          </Link>
          <Link href="/guide" className="hover:text-ink">
            참여 절차
          </Link>
          {session?.role === "member" && (
            <Link href="/me/applications" className="hover:text-ink">
              내 지원
            </Link>
          )}
          {(!session || session.role === "member") && (
            <Link href="/partner-intro" className="hover:text-ink">
              기관 등록
            </Link>
          )}
          {session?.role === "institution" && (
            <Link href="/partner" className="font-bold text-primary-deep hover:underline">
              기관회원
            </Link>
          )}
          {session?.role === "admin" && (
            <Link href="/admin" className="font-bold text-primary-deep hover:underline">
              관리자
            </Link>
          )}
          {session ? (
            <form action="/auth/signout" method="post" className="flex items-center gap-3">
              <span className="hidden max-w-40 truncate sm:inline">{session.email}</span>
              <button type="submit" className="font-bold text-primary hover:underline">
                로그아웃
              </button>
            </form>
          ) : (
            <Link href="/login" className="font-bold text-primary hover:underline">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
