// PUB-08 내 지원 내역 (REQ-011) — RLS app_self_read로 자기 것만 조회됨

import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { createServerSupabase } from "@/lib/supabase/server";
import { CancelButton } from "./cancel-button";

export const metadata = { title: "내 지원 내역" };

const statusLabel: Record<string, { text: string; tone: "open" | "review" | "closed" | "rejected" }> = {
  applied: { text: "접수됨", tone: "review" },
  viewed: { text: "기관 확인", tone: "review" },
  in_progress: { text: "진행 중", tone: "open" },
  selected: { text: "선정", tone: "open" },
  not_selected: { text: "미선정", tone: "closed" },
  canceled: { text: "취소함", tone: "closed" },
};

const CANCELABLE = ["applied", "viewed", "in_progress"];

export default async function MyApplicationsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/me/applications");

  const { data: apps } = await supabase
    .from("applications")
    .select("id, status, applied_at, announcements ( id, title )")
    .order("applied_at", { ascending: false });

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <h1 className="text-2xl font-black">내 지원 내역</h1>
      {!apps || apps.length === 0 ? (
        <EmptyState title="아직 지원한 공고가 없습니다" desc="모집 중인 공고를 찾아보세요." />
      ) : (
        <div className="grid gap-3">
          {apps.map((a) => {
            const s = statusLabel[a.status] ?? { text: a.status, tone: "closed" as const };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ann = (a as any).announcements;
            return (
              <div
                key={a.id}
                className="flex items-center gap-3.5 rounded-(--radius-card) border border-line bg-surface px-4 py-3.5"
              >
                <Badge tone={s.tone}>{s.text}</Badge>
                <div className="min-w-0 flex-1">
                  <a href={`/trials/${ann?.id}`} className="block truncate text-base font-bold hover:underline">
                    {ann?.title ?? "(공고 비공개)"}
                  </a>
                  <p className="mt-0.5 text-sm text-muted">
                    지원일 {new Date(a.applied_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                {CANCELABLE.includes(a.status) && <CancelButton applicationId={a.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
