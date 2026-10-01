"use client";

// PTR-08 지원자 행 — 열람 버튼으로 개인정보 조회(로그 기록), 상태 변경

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusView: Record<string, { text: string; tone: "open" | "review" | "closed" | "rejected" | "dday" }> = {
  applied: { text: "미열람", tone: "dday" },
  viewed: { text: "열람함", tone: "review" },
  in_progress: { text: "진행 중", tone: "open" },
  selected: { text: "선정", tone: "open" },
  not_selected: { text: "미선정", tone: "closed" },
  canceled: { text: "지원자 취소", tone: "closed" },
};

interface Detail {
  status: string;
  member: { name: string; phone: string; gender: string; birthDate: string; age: number | null } | null;
  consentSensitive: boolean;
}

export function ApplicantRow({
  row,
  readable,
  reasons,
}: {
  row: { id: number; status: string; region: string; appliedAt: string; maskedName: string };
  readable: boolean;
  reasons: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [status, setStatus] = useState(row.status);
  const [reasonId, setReasonId] = useState("");
  const [selectingReason, setSelectingReason] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s = statusView[status] ?? { text: status, tone: "closed" as const };
  const terminal = ["selected", "not_selected", "canceled"].includes(status);

  async function view() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/partner/applications/${row.id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "열람에 실패했습니다.");
        return;
      }
      setDetail(data);
      setStatus(data.status);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(to: string, withReason = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/partner/applications/${row.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withReason ? { status: to, reasonCodeId: Number(reasonId) } : { status: to }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "상태 변경에 실패했습니다.");
        return;
      }
      setStatus(data.status);
      setSelectingReason(false);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-(--radius-card) border border-line bg-surface px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={s.tone}>{s.text}</Badge>
        <span className="font-bold">{detail?.member?.name ?? row.maskedName}</span>
        <span className="text-sm text-muted">{row.region}</span>
        <span className="text-sm text-muted">
          지원 {new Date(row.appliedAt).toLocaleDateString("ko-KR")}
        </span>
        {!detail && status !== "canceled" && (
          <Button
            variant="outline"
            onClick={view}
            disabled={loading || !readable}
            className="ml-auto !min-h-10 !px-4 !text-[15px]"
          >
            {loading ? "..." : "열람"}
          </Button>
        )}
      </div>

      {detail?.member && (
        <dl className="grid gap-1.5 rounded-(--radius-btn) bg-bg px-4 py-3 text-[15px] sm:grid-cols-2">
          <div className="flex gap-2"><dt className="text-muted">연락처</dt><dd className="tabular-nums">{detail.member.phone}</dd></div>
          <div className="flex gap-2"><dt className="text-muted">성별·나이</dt><dd>{detail.member.gender === "female" ? "여성" : "남성"} · 만 {detail.member.age}세 ({detail.member.birthDate})</dd></div>
          <div className="flex gap-2 sm:col-span-2"><dt className="text-muted">민감정보 동의</dt><dd>{detail.consentSensitive ? "수집·제공 동의함" : "동의 없음 (건강정보 요구 불가)"}</dd></div>
        </dl>
      )}

      {detail && !terminal && (
        <div className="flex flex-wrap items-center gap-2">
          {status === "viewed" && (
            <Button onClick={() => changeStatus("in_progress")} disabled={loading} className="!min-h-10 !px-4 !text-[15px]">
              진행 시작
            </Button>
          )}
          {(status === "viewed" || status === "in_progress") && !selectingReason && (
            <>
              <Button variant="outline" onClick={() => changeStatus("selected")} disabled={loading} className="!min-h-10 !px-4 !text-[15px]">
                선정
              </Button>
              <Button variant="outline" onClick={() => setSelectingReason(true)} disabled={loading} className="!min-h-10 !px-4 !text-[15px] !border-err !text-err">
                미선정
              </Button>
            </>
          )}
          {selectingReason && (
            <span className="flex flex-wrap items-center gap-2">
              <select
                value={reasonId}
                onChange={(e) => setReasonId(e.target.value)}
                className="min-h-10 rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-2 text-[15px]"
              >
                <option value="">미선정 사유 선택</option>
                {reasons.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <Button
                variant="accent"
                onClick={() => changeStatus("not_selected", true)}
                disabled={loading || !reasonId}
                className="!min-h-10 !px-4 !text-[15px]"
              >
                확정
              </Button>
              <button onClick={() => setSelectingReason(false)} className="text-sm text-muted hover:underline">
                취소
              </button>
            </span>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-bold text-err">
          {error}
        </p>
      )}
    </div>
  );
}
