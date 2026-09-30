// PTR-02/03 — 기관 상태별 첫 화면: 대기/반려/정지 안내, 승인 시 대시보드 자리

import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { StatTile } from "@/components/ui/cards";
import { getMyInstitution } from "@/lib/institution";
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

  // approved — 대시보드 (공고·지원자 수치는 PR #6~7에서 실데이터 연결)
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black">{inst.name}</h1>
        <Badge tone="open">승인된 기관</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="게시 중 공고" value="—" sub="공고 관리는 곧 제공됩니다" />
        <StatTile label="새 지원자 (미열람)" value="—" accent />
        <StatTile label="진행 중 지원자" value="—" />
      </div>
      <p className="text-[15px] text-muted">
        공고 등록(검수 후 게시)과 지원자 관리는 다음 업데이트에서 열립니다.
      </p>
    </div>
  );
}
