// PTR-04 공고 목록 — 자기 기관 공고 상태별

import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { getMyInstitution } from "@/lib/institution";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { statusBadge } from "./status-badge";

export const metadata = { title: "공고 관리" };

export default async function PartnerTrialsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/partner/trials");
  const inst = await getMyInstitution(user.id);
  if (!inst) redirect("/partner/signup");
  if (inst.status !== "approved") redirect("/partner");

  const db = createAdminClient();
  const { data: anns } = await db
    .from("announcements")
    .select("id, title, status, recruit_start, recruit_end, created_at")
    .eq("institution_id", inst.id)
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black">공고 관리</h1>
        <ButtonLink href="/partner/trials/new">새 공고 작성</ButtonLink>
      </div>
      {!anns || anns.length === 0 ? (
        <EmptyState title="등록한 공고가 없습니다" desc="첫 모집공고를 작성해 보세요. 검수 후 게시됩니다." />
      ) : (
        <div className="grid gap-3">
          {anns.map((a) => {
            const s = statusBadge[a.status] ?? { text: a.status, tone: "closed" as const };
            return (
              <Link
                key={a.id}
                href={`/partner/trials/${a.id}`}
                className="flex items-center gap-3.5 rounded-(--radius-card) border border-line bg-surface px-4 py-3.5 transition hover:border-primary"
              >
                <Badge tone={s.tone}>{s.text}</Badge>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold">{a.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">
                    모집 {a.recruit_start} ~ {a.recruit_end}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
