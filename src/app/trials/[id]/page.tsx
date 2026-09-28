// 기준 페이지: 상세 (docs/design.md — 요약 카드 상단 + 본문 + 하단 고정 CTA)

import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SummaryCard } from "@/components/ui/cards";
import { StickyCTA } from "@/components/ui/form";
import { dDay, getMockAnnouncement, isRecruiting } from "@/lib/mock";

export default async function TrialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trial = getMockAnnouncement(Number(id));
  if (!trial) notFound();

  const recruiting = isRecruiting(trial);

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <div>
        <Badge tone={recruiting ? "open" : "closed"}>
          {recruiting ? `모집중 · D-${dDay(trial.recruitEnd)}` : "마감"}
        </Badge>
      </div>
      <h1 className="text-2xl leading-snug font-black text-balance">{trial.title}</h1>
      <SummaryCard trial={trial} />
      <section className="grid gap-2">
        <h2 className="text-base font-bold text-muted">시험 소개</h2>
        <p className="text-base leading-relaxed">{trial.body}</p>
      </section>
      <StickyCTA>
        {recruiting ? (
          <ButtonLink href={`/trials/${trial.id}/apply`} variant="accent" full>
            이 시험에 지원하기
          </ButtonLink>
        ) : (
          <p className="py-2 text-center text-[15px] text-muted">모집이 마감된 공고입니다.</p>
        )}
      </StickyCTA>
    </div>
  );
}
