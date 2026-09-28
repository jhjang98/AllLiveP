"use client";

// 목록의 검색·필터 (클라이언트 인메모리 — 공고 수천 건까지 충분, 전환 조건은 ADR-0001)

import { useMemo, useState } from "react";
import { TrialCard } from "@/components/ui/cards";
import { FilterChip, SearchBar } from "@/components/ui/chips";
import { EmptyState } from "@/components/ui/states";
import { type AnnouncementView, isRecruiting } from "@/lib/announcement-view";

export function TrialList({ trials }: { trials: AnnouncementView[] }) {
  const [query, setQuery] = useState("");
  const [indication, setIndication] = useState("전체");
  const [recruitingOnly, setRecruitingOnly] = useState(true);

  const indications = useMemo(
    () => ["전체", ...new Set(trials.flatMap((t) => t.indications))],
    [trials],
  );

  const results = useMemo(
    () =>
      trials.filter((t) => {
        if (recruitingOnly && !isRecruiting(t)) return false;
        if (indication !== "전체" && !t.indications.includes(indication)) return false;
        if (query && !`${t.title} ${t.institutionName}`.includes(query.trim())) return false;
        return true;
      }),
    [trials, query, indication, recruitingOnly],
  );

  return (
    <>
      <SearchBar value={query} onChange={setQuery} />
      <div className="flex flex-wrap gap-2">
        {indications.map((name) => (
          <FilterChip key={name} active={indication === name} onClick={() => setIndication(name)}>
            {name}
          </FilterChip>
        ))}
        <FilterChip active={recruitingOnly} onClick={() => setRecruitingOnly(!recruitingOnly)}>
          모집중만
        </FilterChip>
      </div>
      <p className="text-sm text-muted">검색 결과 {results.length}건</p>
      {results.length === 0 ? (
        <EmptyState title="조건에 맞는 공고가 없습니다" desc="필터를 바꾸거나 검색어를 지워보세요." />
      ) : (
        <div className="grid gap-4">
          {results.map((t) => (
            <TrialCard key={t.id} trial={t} />
          ))}
        </div>
      )}
    </>
  );
}
