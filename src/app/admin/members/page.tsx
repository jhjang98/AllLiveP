// ADM-05 회원 관리 — 목록 조회 (개인정보는 마스킹 원칙, 세부는 추후 필요 시)

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { maskName } from "@/lib/applicant-access";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "회원 관리" };

function maskPhone(phone: string | null): string {
  if (!phone || phone.length < 8) return "-";
  return `${phone.slice(0, 3)}-****-${phone.slice(-4)}`;
}

export default async function AdminMembersPage() {
  const db = createAdminClient();
  const { data: profiles } = await db
    .from("profiles")
    .select("id, name, phone, phone_verified_at, created_at, withdrawn_at")
    .eq("role", "member")
    .order("created_at", { ascending: false })
    .limit(100);

  // 이메일 매핑 — 전 페이지 순회 (페이지당 200, 상한 20페이지)
  const emailById = new Map<string, string>();
  for (let page = 1; page <= 20; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
    for (const u of data.users) emailById.set(u.id, u.email ?? "-");
    if (data.users.length < 200) break;
  }

  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-black">회원 관리</h1>
      <p className="-mt-3 text-sm text-muted">최근 가입 100명 · 개인정보는 마스킹 표시</p>
      {!profiles || profiles.length === 0 ? (
        <EmptyState title="일반회원이 없습니다" />
      ) : (
        <div className="grid gap-2.5">
          {profiles.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-(--radius-card) border border-line bg-surface px-4 py-3 text-[15px]">
              {p.withdrawn_at ? (
                <Badge tone="closed">탈퇴</Badge>
              ) : p.phone_verified_at ? (
                <Badge tone="open">본인확인</Badge>
              ) : (
                <Badge tone="review">미확인</Badge>
              )}
              <span className="font-bold">{maskName(p.name)}</span>
              <span className="text-muted tabular-nums">{maskPhone(p.phone)}</span>
              <span className="min-w-0 flex-1 truncate text-muted">{emailById.get(p.id) ?? "-"}</span>
              <span className="text-sm text-muted">가입 {new Date(p.created_at).toLocaleDateString("ko-KR")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
