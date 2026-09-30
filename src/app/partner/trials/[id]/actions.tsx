"use client";

// 제출·조기마감 버튼 (상태별 노출)

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AnnouncementActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<null | "close">(null);
  const [error, setError] = useState<string | null>(null);

  async function call(path: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(path, { method: "POST" });
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
      setConfirming(null);
    }
  }

  return (
    <span className="flex flex-wrap items-center gap-3">
      {(status === "draft" || status === "rejected") && (
        <Button onClick={() => call(`/api/partner/announcements/${id}/submit`)} disabled={loading}>
          {loading ? "처리 중..." : "검수 제출"}
        </Button>
      )}
      {status === "approved" &&
        (confirming === "close" ? (
          <>
            <Button variant="accent" onClick={() => call(`/api/partner/announcements/${id}/close`)} disabled={loading}>
              {loading ? "처리 중..." : "조기마감 확정"}
            </Button>
            <button onClick={() => setConfirming(null)} className="text-sm text-muted hover:underline">
              돌아가기
            </button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setConfirming("close")}>
            조기마감
          </Button>
        ))}
      {status === "pending_review" && <span className="text-[15px] text-muted">관리자 검수를 기다리고 있습니다.</span>}
      {error && <span className="text-sm font-bold text-err">{error}</span>}
    </span>
  );
}
