import { ButtonLink } from "@/components/ui/button";
import { TrialCard } from "@/components/ui/cards";
import { isRecruiting, listAnnouncements } from "@/lib/announcements";

export default async function HomePage() {
  const recruiting = (await listAnnouncements()).filter(isRecruiting);
  return (
    <div className="grid gap-8">
      <section className="grid gap-3 py-6 text-center">
        <h1 className="text-3xl font-black text-balance">
          건강한 참여, 신뢰할 수 있는 임상시험
        </h1>
        <p className="text-muted">검수를 거친 모집 공고만 게시됩니다.</p>
        <ButtonLink href="/trials" className="mx-auto mt-2">
          공고 찾아보기
        </ButtonLink>
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-bold text-muted">지금 모집 중</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recruiting.map((t) => (
            <TrialCard key={t.id} trial={t} />
          ))}
        </div>
      </section>

      <section className="rounded-(--radius-card) bg-primary-soft p-5 text-primary-deep">
        <b className="block text-base">아직 맞는 공고가 없나요?</b>
        <p className="mt-1 text-[15px]">
          관심 질환을 등록해 두면 새 공고가 올라올 때 알려드립니다. (예비참여희망자 — 추후 제공)
        </p>
      </section>
    </div>
  );
}
