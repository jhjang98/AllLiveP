"use client";

// 승인/반려 공용 버튼 (반려는 사유 입력 필수) — 공고 검수·기관 승인 화면에서 사용

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DecisionButtons({
  approveUrl,
  rejectUrl,
  approveBody,
  rejectBodyBase,
}: {
  approveUrl: string;
  rejectUrl: string;
  approveBody: Record<string, unknown>;
  rejectBodyBase: Record<string, unknown>;
}) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(url: string, body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error?.message ?? "처리에 실패했습니다.");
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setRejecting(false);
      setReason("");
    }
  }

  if (rejecting) {
    return (
      <div className="grid w-full gap-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="반려 사유 (기관에 전달됩니다)"
          className="w-full rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 py-2 text-[15px]"
        />
        <div className="flex gap-2">
          <Button
            variant="accent"
            onClick={() => call(rejectUrl, { ...rejectBodyBase, reason })}
            disabled={loading || reason.trim().length === 0}
          >
            {loading ? "처리 중..." : "반려 확정"}
          </Button>
          <button onClick={() => setRejecting(false)} className="text-sm text-muted hover:underline">
            취소
          </button>
        </div>
        {error && <p className="text-sm font-bold text-err">{error}</p>}
      </div>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <Button onClick={() => call(approveUrl, approveBody)} disabled={loading} className="!min-h-10 !px-4 !text-[15px]">
        {loading ? "..." : "승인"}
      </Button>
      <Button variant="outline" onClick={() => setRejecting(true)} className="!min-h-10 !px-4 !text-[15px] !border-err !text-err">
        반려
      </Button>
      {error && <span className="text-sm font-bold text-err">{error}</span>}
    </span>
  );
}
