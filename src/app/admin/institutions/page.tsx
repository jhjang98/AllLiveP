// ADM-02 기관 승인 — 승인 대기 목록 + 증빙 열람 + 승인/반려 (전체 기관 현황 포함)

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { createAdminClient } from "@/lib/supabase/admin";
import { DecisionButtons } from "../decision-buttons";

export const metadata = { title: "기관 승인" };

const tone: Record<string, "open" | "review" | "rejected" | "closed"> = {
  pending: "review",
  approved: "open",
  rejected: "rejected",
  suspended: "closed",
};
const label: Record<string, string> = {
  pending: "승인 대기",
  approved: "승인됨",
  rejected: "반려됨",
  suspended: "정지",
};

export default async function AdminInstitutionsPage() {
  const db = createAdminClient();
  const { data: insts } = await db
    .from("institutions")
    .select("id, name, biz_reg_no, biz_cert_path, phone, address, address_detail, status, status_reason, created_at")
    .order("created_at", { ascending: false });

  // 증빙은 비공개 버킷 — 10분짜리 서명 URL로만 열람 (열람 주체는 이 페이지에 이미 admin 게이트)
  const withCert = await Promise.all(
    (insts ?? []).map(async (i) => {
      if (i.status !== "pending") return { ...i, certUrl: null as string | null };
      const { data } = await db.storage.from("certs").createSignedUrl(i.biz_cert_path, 600);
      return { ...i, certUrl: data?.signedUrl ?? null };
    }),
  );

  const pending = withCert.filter((i) => i.status === "pending");
  const others = withCert.filter((i) => i.status !== "pending");

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-black">기관 승인</h1>

      <section className="grid gap-4">
        <h2 className="text-base font-bold text-muted">승인 대기 {pending.length}건</h2>
        {pending.length === 0 ? (
          <EmptyState title="승인 대기 중인 기관이 없습니다" />
        ) : (
          pending.map((i) => (
            <div key={i.id} className="grid gap-3 rounded-(--radius-card) border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="review">승인 대기</Badge>
                <h3 className="text-lg font-bold">{i.name}</h3>
              </div>
              <dl className="grid gap-1.5 text-[15px] sm:grid-cols-2">
                <div className="flex gap-2"><dt className="text-muted">사업자번호</dt><dd className="tabular-nums">{i.biz_reg_no}</dd></div>
                <div className="flex gap-2"><dt className="text-muted">연락처</dt><dd>{i.phone}</dd></div>
                <div className="flex gap-2 sm:col-span-2"><dt className="text-muted">주소</dt><dd>{i.address} {i.address_detail ?? ""}</dd></div>
              </dl>
              {i.certUrl ? (
                <a href={i.certUrl} target="_blank" rel="noreferrer" className="justify-self-start text-[15px] font-bold text-primary underline">
                  사업자등록증 열람 (10분 유효)
                </a>
              ) : (
                <span className="text-sm text-err">증빙 파일을 불러오지 못했습니다</span>
              )}
              <DecisionButtons
                approveUrl={`/api/admin/institutions/${i.id}/decision`}
                rejectUrl={`/api/admin/institutions/${i.id}/decision`}
                approveBody={{ action: "approve" }}
                rejectBodyBase={{ action: "reject" }}
              />
            </div>
          ))
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-base font-bold text-muted">전체 기관</h2>
        {others.map((i) => (
          <div key={i.id} className="flex items-center gap-3.5 rounded-(--radius-card) border border-line bg-surface px-4 py-3">
            <Badge tone={tone[i.status] ?? "closed"}>{label[i.status] ?? i.status}</Badge>
            <span className="min-w-0 flex-1 truncate font-bold">{i.name}</span>
            <span className="text-sm text-muted tabular-nums">{i.biz_reg_no}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
