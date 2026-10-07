"use client";

// 홈 상단 모집중 공고 자동 슬라이드 배너 (PUB-01)
// 5초 자동 전환 · 마우스 올리면 일시정지 · prefers-reduced-motion 시 자동 전환 없음

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { type AnnouncementView, dDay, genderLabel, targetLabel } from "@/lib/announcement-view";

// 적응증 카테고리별 비주얼 (썸네일이 없는 공고의 대체 그래픽 — 그린 팔레트 내 색조 변주)
function categoryHue(name: string): number {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 95 + (h % 75); // 95~169: 그린~틸 범위
}

function CategoryVisual({ category }: { category: string }) {
  const hue = categoryHue(category);
  return (
    <div
      aria-hidden
      className="relative flex h-full min-h-36 w-full items-end overflow-hidden rounded-(--radius-card)"
      style={{
        background: `
          radial-gradient(120% 90% at 85% 10%, hsl(${hue} 45% 72% / .9), transparent 55%),
          radial-gradient(100% 100% at 15% 90%, hsl(${hue + 25} 40% 38%), transparent 60%),
          linear-gradient(135deg, hsl(${hue} 42% 30%), hsl(${hue + 15} 45% 44%))`,
      }}
    >
      {/* 십자(+) 모티프 */}
      <svg viewBox="0 0 100 100" className="absolute -top-4 -right-4 h-36 w-36 opacity-20">
        <path d="M40 10h20v30h30v20H60v30H40V60H10V40h30z" fill="white" />
      </svg>
      <span className="m-4 rounded-full bg-white/85 px-3.5 py-1 text-sm font-bold" style={{ color: `hsl(${hue + 20} 50% 24%)` }}>
        {category}
      </span>
    </div>
  );
}

export function HeroCarousel({ slides }: { slides: AnnouncementView[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (slides.length < 2 || paused || reducedMotion.current) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="모집 중인 임상시험"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative overflow-hidden rounded-(--radius-card) border border-line bg-surface"
    >
      <div
        className="flex transition-transform duration-500 motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((t, i) => (
          <article
            key={t.id}
            aria-hidden={i !== index}
            className="grid w-full flex-none gap-4 p-5 sm:grid-cols-[1fr_300px] sm:p-7"
          >
            <div className="grid content-center gap-3">
              <div className="flex items-center gap-2.5">
                <Badge tone="open">모집중</Badge>
                {/* 자정 전후 서버·클라이언트 계산 차이 허용 */}
                <span suppressHydrationWarning className="text-sm font-bold text-accent tabular-nums">
                  D-{dDay(t.recruitEnd)}
                </span>
              </div>
              <h2 className="line-clamp-2 text-xl leading-snug font-black text-balance sm:text-2xl">
                {t.title}
              </h2>
              <p className="text-[15px] text-muted">
                {t.institutionName} · {targetLabel[t.target]} · 만 {t.ageMin}~{t.ageMax}세 ·{" "}
                {genderLabel[t.gender]}
              </p>
              <div>
                <ButtonLink href={`/trials/${t.id}`} variant="accent" tabIndex={i === index ? 0 : -1}>
                  자세히 보기
                </ButtonLink>
              </div>
            </div>
            <div className="order-first sm:order-none">
              {t.thumbnailUrl ? (
                <Image
                  src={t.thumbnailUrl}
                  alt=""
                  width={600}
                  height={360}
                  className="h-36 w-full rounded-(--radius-card) object-cover sm:h-full sm:min-h-44"
                />
              ) : (
                <CategoryVisual category={t.indications[0] ?? "임상시험"} />
              )}
            </div>
          </article>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-3.5">
          <button
            aria-label="이전 공고"
            onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
            className="rounded-full px-2 text-lg text-muted hover:text-ink"
          >
            ‹
          </button>
          {slides.map((t, i) => (
            <button
              key={t.id}
              aria-label={`${i + 1}번째 공고`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-2.5 bg-line hover:bg-muted"
              }`}
            />
          ))}
          <button
            aria-label="다음 공고"
            onClick={() => setIndex((index + 1) % slides.length)}
            className="rounded-full px-2 text-lg text-muted hover:text-ink"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
