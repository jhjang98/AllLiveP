// 기관회원 영역 공통 게이트: 로그인 필수 (기관 유무·상태 분기는 각 페이지에서)

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/partner");
  return <div className="mx-auto grid max-w-4xl gap-6">{children}</div>;
}
