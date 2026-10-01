// 관리자 영역 게이트: profiles.role=admin만 접근 (docs/permissions.md)

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/");

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <nav className="flex flex-wrap gap-4 border-b border-line pb-3 text-[15px]">
        <Link href="/admin" className="font-bold text-primary-deep hover:underline">
          관리자 홈
        </Link>
        <Link href="/admin/reviews" className="text-muted hover:text-ink">
          공고 검수
        </Link>
        <Link href="/admin/institutions" className="text-muted hover:text-ink">
          기관 승인
        </Link>
      </nav>
      {children}
    </div>
  );
}
