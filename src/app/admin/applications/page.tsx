// ADM-06 전체 지원 현황 — 마스킹 목록 (개인정보 상세는 기관 화면과 동일 원칙으로 제공하지 않음)

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { maskName } from "@/lib/applicant-access";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "지원 현황" };

const statusView: Record<string, { text: string; tone: "open" | "review" | "closed" | "rejected" | "dday" }> = {
  applied: { text: "접수", tone: "dday" },
  viewed: { text: "기관 확인", tone: "review" },
  in_progress: { text: "진행", tone: "open" },
  selected: { text: "선정", tone: "open" },
  not_selected: { text: "미선정", tone: "closed" },
  canceled: { text: "취소", tone: "closed" },
};

export default async function AdminApplicationsPage() {
  const db = createAdminClient();
  const { data: apps } = await db
    .from("applications")
    .select(
      "id, status, applied_at, city, district, profiles ( name ), announcements ( title, institutions ( name ) )",
    )
    .order("applied_at", { ascending: false })
    .limit(100);

  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-black">지원 현황</h1>
      <p className="-mt-3 text-sm text-muted">최근 100건</p>
      {!apps || apps.length === 0 ? (
        <EmptyState title="지원 내역이 없습니다" />
      ) : (
        <div className="grid gap-2.5">
          {apps.map((a) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const row = a as any;
            const s = statusView[a.status] ?? { text: a.status, tone: "closed" as const };
            return (
              <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-(--radius-card) border border-line bg-surface px-4 py-3 text-[15px]">
                <Badge tone={s.tone}>{s.text}</Badge>
                <span className="font-bold">{maskName(row.profiles?.name)}</span>
                <span className="text-muted">{a.city} {a.district}</span>
                <span className="min-w-0 flex-1 truncate">{row.announcements?.title}</span>
                <span className="text-sm text-muted">{row.announcements?.institutions?.name}</span>
                <span className="text-sm text-muted">{new Date(a.applied_at).toLocaleDateString("ko-KR")}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
