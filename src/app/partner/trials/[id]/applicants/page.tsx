// PTR-07 지원자 목록 — 목록은 마스킹(비식별), 상세 열람 시에만 개인정보 + 로그

import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { maskName, readingDeadline, withinReadingPeriod } from "@/lib/applicant-access";
import { getOwnedAnnouncement } from "@/lib/partner-announcements";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { ApplicantRow } from "./applicant-row";

export const metadata = { title: "지원자 관리" };

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
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

  const readable = withinReadingPeriod(ann.recruit_end, ann.reading_period_months);
  const deadline = readingDeadline(ann.recruit_end, ann.reading_period_months);

  const db = createAdminClient();
  const [{ data: apps }, { data: reasons }] = await Promise.all([
    db
      .from("applications")
      .select("id, status, city, district, applied_at, profiles ( name )")
      .eq("announcement_id", ann.id)
      .order("applied_at", { ascending: false }),
    db.from("codes").select("id, name").eq("type", "not_selected_reason").eq("active", true).order("sort"),
  ]);

  const rows = (apps ?? []).map((a) => ({
    id: a.id,
    status: a.status,
    region: `${a.city} ${a.district}`,
    appliedAt: a.applied_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    maskedName: maskName((a as any).profiles?.name ?? null),
  }));
  const unviewed = rows.filter((r) => r.status === "applied").length;

  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h1 className="text-2xl font-black">지원자 관리</h1>
        <p className="text-[15px] text-muted">{ann.title}</p>
        <p className="text-sm text-muted">
          총 {rows.length}명 · 미열람 <b className="text-accent">{unviewed}</b>명 · 열람기한{" "}
          {deadline.toISOString().slice(0, 10)}
        </p>
      </div>

      {!readable && (
        <p className="rounded-(--radius-card) border border-line bg-surface px-4 py-3 text-[15px] text-err">
          열람 기간이 종료되어 지원자 개인정보를 열람할 수 없습니다. (모집 종료 +{" "}
          {ann.reading_period_months / 12}년)
        </p>
      )}

      {rows.length === 0 ? (
        <EmptyState title="아직 지원자가 없습니다" />
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <ApplicantRow key={r.id} row={r} readable={readable} reasons={reasons ?? []} />
          ))}
        </div>
      )}

      <p className="text-sm text-muted">
        <Badge tone="review">안내</Badge> 개인정보 열람 시 열람자·일시·IP가 기록됩니다.
      </p>
    </div>
  );
}
