// PUB-11 자주 묻는 질문 — RLS faqs_read(published)로 익명 조회

import { EmptyState } from "@/components/ui/states";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "자주 묻는 질문" };

export default async function FaqPage() {
  const supabase = await createServerSupabase();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("id, category, question, answer")
    .order("sort")
    .limit(100);

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <h1 className="text-2xl font-black">자주 묻는 질문</h1>
      {!faqs || faqs.length === 0 ? (
        <EmptyState title="등록된 FAQ가 없습니다" />
      ) : (
        <div className="grid gap-3">
          {faqs.map((f) => (
            <details key={f.id} className="rounded-(--radius-card) border border-line bg-surface px-5 py-4">
              <summary className="cursor-pointer text-base font-bold">
                {f.category && <span className="mr-2 text-sm text-primary">[{f.category}]</span>}
                {f.question}
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line">{f.answer}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
