// ADM-01 관리자 대시보드 (최소판) — 대기 건수와 바로가기

import { StatTile } from "@/components/ui/cards";
import { ButtonLink } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "관리자" };

export default async function AdminHome() {
  const db = createAdminClient();
  const [{ count: pendingReviews }, { count: pendingInstitutions }, { count: published }] =
    await Promise.all([
      db.from("announcements").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      db.from("institutions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("announcements").select("id", { count: "exact", head: true }).eq("status", "approved"),
    ]);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-black">관리자</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="검수 대기 공고" value={pendingReviews ?? 0} accent={(pendingReviews ?? 0) > 0} />
        <StatTile label="승인 대기 기관" value={pendingInstitutions ?? 0} accent={(pendingInstitutions ?? 0) > 0} />
        <StatTile label="게시 중 공고" value={published ?? 0} />
      </div>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/admin/reviews">공고 검수</ButtonLink>
        <ButtonLink href="/admin/trials" variant="outline">
          공고 관리
        </ButtonLink>
        <ButtonLink href="/admin/institutions" variant="outline">
          기관 승인
        </ButtonLink>
      </div>
    </div>
  );
}
