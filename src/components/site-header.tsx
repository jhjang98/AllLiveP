import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

async function getUserEmail(): Promise<string | null> {
  // env 미설정(로컬 초기 세팅 전)에서도 페이지가 뜨도록 방어
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export async function SiteHeader() {
  const email = await getUserEmail();
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-black text-primary-deep">
          AllLive<span className="text-accent">P</span>
        </Link>
        <nav className="flex items-center gap-5 text-[15px] text-muted">
          <Link href="/trials" className="hover:text-ink">
            공고 찾기
          </Link>
          {email ? (
            <form action="/auth/signout" method="post" className="flex items-center gap-3">
              <span className="max-w-40 truncate">{email}</span>
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
