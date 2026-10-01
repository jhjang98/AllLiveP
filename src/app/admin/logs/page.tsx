// ADM-09 감사 로그 — 개인정보 열람(pii_view) 기록 조회 (읽기 전용, append-only)

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { maskName } from "@/lib/applicant-access";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "감사 로그" };

export default async function AdminLogsPage() {
  const db = createAdminClient();
  const { data: events } = await db
    .from("application_events")
    .select(
      `id, created_at, ip, actor_role,
       actor:profiles!application_events_actor_id_fkey ( name ),
       applications ( id, profiles ( name ), announcements ( title, institutions ( name ) ) )`,
    )
    .eq("event", "pii_view")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-black">감사 로그 — 개인정보 열람</h1>
      <p className="-mt-3 text-sm text-muted">최근 100건 · 이 기록은 수정·삭제할 수 없습니다</p>
      {!events || events.length === 0 ? (
        <EmptyState title="열람 기록이 없습니다" />
      ) : (
        <div className="grid gap-2.5">
          {events.map((e) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const row = e as any;
            return (
              <div key={e.id} className="flex flex-wrap items-center gap-3 rounded-(--radius-card) border border-line bg-surface px-4 py-3 text-[15px]">
                <Badge tone="review">열람</Badge>
                <span className="font-bold">{row.actor?.name ?? "담당자"}</span>
                <span className="text-sm text-muted">{row.applications?.announcements?.institutions?.name}</span>
                <span>→ 지원자 {maskName(row.applications?.profiles?.name)}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted">{row.applications?.announcements?.title}</span>
                <span className="text-sm text-muted tabular-nums">{e.ip ?? "-"}</span>
                <span className="text-sm text-muted">{new Date(e.created_at).toLocaleString("ko-KR")}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
