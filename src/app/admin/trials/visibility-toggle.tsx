"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function VisibilityToggle({ id, hidden }: { id: number; hidden: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/announcements/${id}/visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !hidden }),
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
      setConfirming(false);
    }
  }

  if (error) return <span className="font-bold text-err">{error}</span>;

  if (!hidden && !confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="font-bold text-err hover:underline">
        강제 비노출
      </button>
    );
  }
  if (!hidden && confirming) {
    return (
      <span className="flex items-center gap-2">
        <button onClick={toggle} disabled={loading} className="font-bold text-err hover:underline">
          {loading ? "처리 중..." : "비노출 확정"}
        </button>
        <button onClick={() => setConfirming(false)} className="text-muted hover:underline">
          취소
        </button>
      </span>
    );
  }
  return (
    <button onClick={toggle} disabled={loading} className="font-bold text-primary hover:underline">
      {loading ? "처리 중..." : "노출 복구"}
    </button>
  );
}
