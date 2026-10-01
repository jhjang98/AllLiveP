// ADM-03 공고 검수 — 대기 목록 + 내용 펼쳐보기 + 승인/반려

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { genderLabel, targetLabel } from "@/lib/announcement-view";
import { createAdminClient } from "@/lib/supabase/admin";
import { DecisionButtons } from "../decision-buttons";

export const metadata = { title: "공고 검수" };

export default async function AdminReviewsPage() {
  const db = createAdminClient();
  const { data: anns } = await db
    .from("announcements")
    .select(
      `id, title, protocol_no, sponsor_name, target, gender, age_min, age_max, target_count,
       recruit_start, recruit_end, participation_text, body, reading_period_months,
       sensitive_consent_required, updated_at,
       institutions ( name ), announcement_indications ( codes ( name ) )`,
    )
    .eq("status", "pending_review")
    .order("updated_at", { ascending: true });

  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-black">공고 검수</h1>
      {!anns || anns.length === 0 ? (
        <EmptyState title="검수 대기 중인 공고가 없습니다" />
      ) : (
        <div className="grid gap-4">
          {anns.map((a) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const row = a as any;
            const indications = (row.announcement_indications ?? [])
              .map((x: { codes: { name: string } | null }) => x.codes?.name)
              .filter(Boolean)
              .join(", ");
            return (
              <div key={a.id} className="grid gap-3 rounded-(--radius-card) border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="review">검수 대기</Badge>
                  <h2 className="text-lg font-bold">{a.title}</h2>
                  <span className="text-sm text-muted">{row.institutions?.name}</span>
                </div>
                <dl className="grid gap-1.5 text-[15px] sm:grid-cols-2">
                  <div className="flex gap-2"><dt className="text-muted">적응증</dt><dd>{indications || "-"}</dd></div>
                  <div className="flex gap-2"><dt className="text-muted">대상</dt><dd>{targetLabel[a.target as keyof typeof targetLabel]} · {genderLabel[a.gender as keyof typeof genderLabel]} · 만 {a.age_min}~{a.age_max}세</dd></div>
                  <div className="flex gap-2"><dt className="text-muted">모집기간</dt><dd>{a.recruit_start} ~ {a.recruit_end}</dd></div>
                  <div className="flex gap-2"><dt className="text-muted">열람기간</dt><dd>종료 후 {a.reading_period_months / 12}년 · 민감동의 {a.sensitive_consent_required ? "필수" : "선택"}</dd></div>
                  {a.sponsor_name && <div className="flex gap-2"><dt className="text-muted">의뢰기관</dt><dd>{a.sponsor_name}</dd></div>}
                  {a.protocol_no && <div className="flex gap-2"><dt className="text-muted">프로토콜</dt><dd>{a.protocol_no}</dd></div>}
                </dl>
                <details className="rounded-(--radius-btn) border border-line bg-bg px-4 py-2.5">
                  <summary className="cursor-pointer text-[15px] font-bold">시험 설명 전문 보기</summary>
                  <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line">{a.body}</p>
                </details>
                <DecisionButtons
                  approveUrl={`/api/admin/announcements/${a.id}/review`}
                  rejectUrl={`/api/admin/announcements/${a.id}/review`}
                  approveBody={{ action: "approve" }}
                  rejectBodyBase={{ action: "reject" }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
