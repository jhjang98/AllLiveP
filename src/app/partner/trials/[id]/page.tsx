// PTR-06 공고 상세(내부) — 상태·반려사유 표시, 제출/수정/조기마감

import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getOwnedAnnouncement } from "@/lib/partner-announcements";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { statusBadge } from "../status-badge";
import { AnnouncementActions } from "./actions";

export default async function PartnerTrialDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/partner/trials");

  const { id } = await params;
  const owned = await getOwnedAnnouncement(user.id, Number(id));
  if (owned.error === "institution") redirect("/partner");
  if (owned.error === "not_found") notFound();
  const ann = owned.announcement;
  const s = statusBadge[ann.status] ?? { text: ann.status, tone: "closed" as const };

  const db = createAdminClient();
  const [{ count: applicants }, { count: unviewed }] = await Promise.all([
    db.from("applications").select("id", { count: "exact", head: true }).eq("announcement_id", ann.id),
    db.from("applications").select("id", { count: "exact", head: true }).eq("announcement_id", ann.id).eq("status", "applied"),
  ]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={s.tone}>{s.text}</Badge>
        <h1 className="text-xl font-black">{ann.title}</h1>
      </div>

      {ann.status === "rejected" && ann.reject_reason && (
        <p className="rounded-(--radius-card) border border-line bg-surface px-4 py-3 text-[15px]">
          <b className="text-err">반려 사유:</b> {ann.reject_reason}
        </p>
      )}

      <dl className="grid gap-2.5 rounded-(--radius-card) border border-line bg-surface p-4 text-[15px]">
        <div className="flex gap-3"><dt className="w-28 flex-none text-muted">모집기간</dt><dd>{ann.recruit_start} ~ {ann.recruit_end}</dd></div>
        <div className="flex gap-3"><dt className="w-28 flex-none text-muted">대상</dt><dd>만 {ann.age_min}~{ann.age_max}세</dd></div>
        <div className="flex gap-3"><dt className="w-28 flex-none text-muted">목표 인원</dt><dd>{ann.target_count ?? "제한 없음"}</dd></div>
        <div className="flex gap-3"><dt className="w-28 flex-none text-muted">열람가능기간</dt><dd>모집 종료 후 {ann.reading_period_months / 12}년</dd></div>
      </dl>

      <section className="grid gap-2">
        <h2 className="text-base font-bold text-muted">시험 설명</h2>
        <p className="text-base leading-relaxed whitespace-pre-line">{ann.body}</p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href={`/partner/trials/${ann.id}/applicants`}>
          지원자 보기 ({applicants ?? 0}{(unviewed ?? 0) > 0 ? ` · 미열람 ${unviewed}` : ""})
        </ButtonLink>
        {ann.status !== "closed" && (
          <ButtonLink href={`/partner/trials/${ann.id}/edit`} variant="outline">
            수정
          </ButtonLink>
        )}
        <AnnouncementActions id={ann.id} status={ann.status} />
        {ann.status === "approved" && (
          <ButtonLink href={`/trials/${ann.id}`} variant="outline">
            게시된 화면 보기
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
