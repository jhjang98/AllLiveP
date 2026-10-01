// ADM-07 코드 관리 — 유형별 목록 + 추가 + 활성 토글 (삭제 없음: 참조 보전)

import { createAdminClient } from "@/lib/supabase/admin";
import { CodeManager } from "./code-manager";

export const metadata = { title: "코드 관리" };

export default async function AdminCodesPage() {
  const db = createAdminClient();
  const { data: codes } = await db
    .from("codes")
    .select("id, type, name, sort, active")
    .order("type")
    .order("sort");

  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-black">코드 관리</h1>
      <p className="-mt-3 text-sm text-muted">
        적응증(관심분야)·임상단계·미선정 사유. 삭제 대신 비활성화를 사용합니다 (기존 공고의 참조 보전).
      </p>
      <CodeManager codes={codes ?? []} />
    </div>
  );
}
