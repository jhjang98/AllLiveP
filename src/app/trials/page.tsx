// 기준 페이지: 목록 — Supabase 실데이터 (RLS: 게시·마감 공고만 조회됨)

import { listAnnouncements } from "@/lib/announcements";
import { TrialList } from "./trial-list";

export const metadata = { title: "공고 찾기" };

export default async function TrialListPage() {
  const trials = await listAnnouncements();
  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <h1 className="text-2xl font-black">공고 찾기</h1>
      <TrialList trials={trials} />
    </div>
  );
}
