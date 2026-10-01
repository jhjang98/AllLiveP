// PUB-11 공지사항 — RLS notices_read(published)로 익명 조회

import { EmptyState } from "@/components/ui/states";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "공지사항" };

export default async function NoticePage() {
  const supabase = await createServerSupabase();
  const { data: notices } = await supabase
    .from("notices")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <h1 className="text-2xl font-black">공지사항</h1>
      {!notices || notices.length === 0 ? (
        <EmptyState title="등록된 공지가 없습니다" />
      ) : (
        <div className="grid gap-3">
          {notices.map((n) => (
            <details key={n.id} className="rounded-(--radius-card) border border-line bg-surface px-5 py-4">
              <summary className="cursor-pointer text-base font-bold">
                {n.title}
                <span className="ml-3 text-sm font-normal text-muted">
                  {new Date(n.created_at).toLocaleDateString("ko-KR")}
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line">{n.body}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
