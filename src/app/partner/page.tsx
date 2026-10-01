// PTR-02/03 — 기관 상태별 첫 화면: 대기/반려/정지 안내, 승인 시 대시보드 자리

import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { StatTile } from "@/components/ui/cards";
import { getMyInstitution } from "@/lib/institution";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "기관회원" };

export default async function PartnerHome() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/partner");

  const inst = await getMyInstitution(user.id);
  if (!inst) redirect("/partner/signup");

  if (inst.status === "pending") {
    return (
      <div className="grid justify-items-center gap-4 py-14 text-center">
        <Badge tone="review">승인 대기</Badge>
        <h1 className="text-2xl font-black">가입 신청을 검토하고 있습니다</h1>
        <p className="max-w-md text-muted">
          {inst.name}의 가입 신청이 접수되었습니다. 관리자 확인 후 결과를 이메일로 알려드립니다.
        </p>
      </div>
    );
  }

  if (inst.status === "rejected") {
    return (
      <div className="grid justify-items-center gap-4 py-14 text-center">
        <Badge tone="rejected">반려됨</Badge>
        <h1 className="text-2xl font-black">가입 신청이 반려되었습니다</h1>
        {inst.statusReason && (
          <p className="max-w-md rounded-(--radius-card) border border-line bg-surface px-5 py-3 text-[15px]">
            사유: {inst.statusReason}
          </p>
        )}
        <ButtonLink href="/partner/signup">수정하여 재신청</ButtonLink>
      </div>
    );
  }

  if (inst.status === "suspended") {
    return (
      <div className="grid justify-items-center gap-4 py-14 text-center">
        <Badge tone="rejected">이용 정지</Badge>
        <h1 className="text-2xl font-black">기관 계정이 정지되었습니다</h1>
        {inst.statusReason && <p className="max-w-md text-muted">사유: {inst.statusReason}</p>}
        <p className="text-sm text-muted">문의: 플랫폼 관리자</p>
      </div>
    );
  }

  // approved — 대시보드 (지원자 수치는 PR #7에서 연결)
  const db = createAdminClient();
  const [{ count: published }, { count: pending }, { count: drafts }, { count: unviewed }, { count: active }] =
    await Promise.all([
      db.from("announcements").select("id", { count: "exact", head: true }).eq("institution_id", inst.id).eq("status", "approved"),
      db.from("announcements").select("id", { count: "exact", head: true }).eq("institution_id", inst.id).eq("status", "pending_review"),
      db.from("announcements").select("id", { count: "exact", head: true }).eq("institution_id", inst.id).in("status", ["draft", "rejected"]),
      db.from("applications").select("id, announcements!inner(institution_id)", { count: "exact", head: true }).eq("announcements.institution_id", inst.id).eq("status", "applied"),
      db.from("applications").select("id, announcements!inner(institution_id)", { count: "exact", head: true }).eq("announcements.institution_id", inst.id).in("status", ["viewed", "in_progress"]),
    ]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black">{inst.name}</h1>
        <Badge tone="open">승인된 기관</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="게시 중 공고" value={published ?? 0} sub={`검수 대기 ${pending ?? 0} · 작성 중 ${drafts ?? 0}`} />
        <StatTile label="새 지원자 (미열람)" value={unviewed ?? 0} accent={(unviewed ?? 0) > 0} />
        <StatTile label="진행 중 지원자" value={active ?? 0} sub="열람·진행 중" />
      </div>
      <div>
        <ButtonLink href="/partner/trials">공고 관리로 이동</ButtonLink>
      </div>
    </div>
  );
}
