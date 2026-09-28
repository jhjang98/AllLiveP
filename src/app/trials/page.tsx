"use client";

// 기준 페이지: 목록 (docs/design.md — 검색바 + 필터 칩 + 카드)
// 참조 구현: 이후 모든 목록 화면은 이 구성을 복제한다.

import { useMemo, useState } from "react";
import { TrialCard } from "@/components/ui/cards";
import { FilterChip, SearchBar } from "@/components/ui/chips";
import { EmptyState } from "@/components/ui/states";
import { isRecruiting, mockAnnouncements } from "@/lib/mock";

const INDICATIONS = ["전체", "내분비", "건강인", "피부", "소화기"];

export default function TrialListPage() {
  const [query, setQuery] = useState("");
  const [indication, setIndication] = useState("전체");
  const [recruitingOnly, setRecruitingOnly] = useState(true);

  const results = useMemo(
    () =>
      mockAnnouncements.filter((t) => {
        if (recruitingOnly && !isRecruiting(t)) return false;
        if (indication !== "전체" && !t.indications.includes(indication)) return false;
        if (query && !`${t.title} ${t.institutionName}`.includes(query.trim())) return false;
        return true;
      }),
    [query, indication, recruitingOnly],
  );

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <h1 className="text-2xl font-black">공고 찾기</h1>
      <SearchBar value={query} onChange={setQuery} />
      <div className="flex flex-wrap gap-2">
        {INDICATIONS.map((name) => (
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
    </div>
  );
}
