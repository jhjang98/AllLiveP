// 기준 페이지: 폼 — 공고는 실데이터, 제출은 아직 목업 (PR #4에서 /api/applications 연동)

import { EmptyState } from "@/components/ui/states";
import { getAnnouncement, isRecruiting } from "@/lib/announcements";
import { ApplyForm } from "./apply-form";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trial = await getAnnouncement(Number(id));

  if (!trial || !isRecruiting(trial)) {
    return (
      <EmptyState title="지원할 수 없는 공고입니다" desc="모집이 마감되었거나 존재하지 않습니다." />
    );
  }

  return <ApplyForm trialId={trial.id} title={trial.title} institutionName={trial.institutionName} />;
}
