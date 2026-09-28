// 기준 페이지: 상세 (docs/design.md — 요약 카드 상단 + 본문 + 하단 고정 CTA)

import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
          <Link
            href={`/trials/${trial.id}/apply`}
            className="flex min-h-12 w-full items-center justify-center rounded-(--radius-btn) bg-accent px-6 py-3 text-[17px] font-bold text-white hover:brightness-95"
          >
            이 시험에 지원하기
          </Link>
        ) : (
          <p className="py-2 text-center text-[15px] text-muted">모집이 마감된 공고입니다.</p>
        )}
      </StickyCTA>
    </div>
  );
}
