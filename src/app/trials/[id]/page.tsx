// 기준 페이지: 상세 — Supabase 실데이터

import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SummaryCard } from "@/components/ui/cards";
import { StickyCTA } from "@/components/ui/form";
import { dDay, getAnnouncement, isRecruiting } from "@/lib/announcements";

export default async function TrialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trial = await getAnnouncement(Number(id));
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
        {/* v1: 본문은 플레인 텍스트 (기관 입력을 그대로 렌더 — XSS 원천 차단). 리치 에디터 도입 시 sanitize와 함께 변경 */}
        <p className="text-base leading-relaxed whitespace-pre-line">{trial.body}</p>
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
