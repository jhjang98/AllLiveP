// ADM-04 공고 관리 — 전체 공고를 상태별 탭으로 조회, 강제 비노출 처리

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { createAdminClient } from "@/lib/supabase/admin";
import { VisibilityToggle } from "./visibility-toggle";

export const metadata = { title: "공고 관리" };

const TABS: Array<{ key: string; label: string; statuses: string[] }> = [
  { key: "all", label: "전체", statuses: [] },
  { key: "pending", label: "검수 대기", statuses: ["pending_review"] },
  { key: "approved", label: "게시 중", statuses: ["approved"] },
  { key: "closed", label: "마감", statuses: ["closed"] },
  { key: "rejected", label: "반려", statuses: ["rejected"] },
  { key: "draft", label: "작성 중", statuses: ["draft"] },
];

const badge: Record<string, { text: string; tone: "open" | "review" | "rejected" | "closed" }> = {
  draft: { text: "작성 중", tone: "closed" },
  pending_review: { text: "검수 대기", tone: "review" },
  rejected: { text: "반려", tone: "rejected" },
  approved: { text: "게시 중", tone: "open" },
  closed: { text: "마감", tone: "closed" },
};

export default async function AdminTrialsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "all" } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  const db = createAdminClient();
  let query = db
    .from("announcements")
    .select(
      `id, title, status, hidden, recruit_start, recruit_end, reject_reason, reviewed_at, created_at,
       institutions ( name ), applications ( count )`,
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (active.statuses.length > 0) query = query.in("status", active.statuses);
  const { data: anns } = await query;

  // 탭별 건수
  const { data: all } = await db.from("announcements").select("status");
  const countOf = (statuses: string[]) =>
    statuses.length === 0 ? (all ?? []).length : (all ?? []).filter((a) => statuses.includes(a.status)).length;

  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-black">공고 관리</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/trials?tab=${t.key}`}
            className={`min-h-10 rounded-full border px-4 py-1.5 text-sm ${
              t.key === active.key
                ? "border-primary bg-primary font-bold text-white"
                : "border-line bg-surface hover:border-primary"
            }`}
          >
            {t.label} {countOf(t.statuses)}
          </Link>
        ))}
      </div>

      {!anns || anns.length === 0 ? (
        <EmptyState title="해당 상태의 공고가 없습니다" />
      ) : (
        <div className="grid gap-3">
          {anns.map((a) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const row = a as any;
            const s = badge[a.status] ?? { text: a.status, tone: "closed" as const };
            const applicants = row.applications?.[0]?.count ?? 0;
            return (
              <div key={a.id} className="grid gap-2 rounded-(--radius-card) border border-line bg-surface px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={s.tone}>{s.text}</Badge>
                  {a.hidden && <Badge tone="rejected">강제 비노출</Badge>}
                  <span className="min-w-0 flex-1 truncate text-base font-bold">{a.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                  <span>{row.institutions?.name}</span>
                  <span>모집 {a.recruit_start} ~ {a.recruit_end}</span>
                  <span>지원 {applicants}건</span>
                  {a.status === "rejected" && a.reject_reason && <span className="text-err">사유: {a.reject_reason}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {a.status === "pending_review" && (
                    <Link href="/admin/reviews" className="font-bold text-primary hover:underline">
                      검수하러 가기 →
                    </Link>
                  )}
                  {(a.status === "approved" || a.status === "closed") && (
                    <>
                      <a href={`/trials/${a.id}`} target="_blank" className="font-bold text-primary hover:underline">
                        공개 화면 보기
                      </a>
                      <VisibilityToggle id={a.id} hidden={a.hidden} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
