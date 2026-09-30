"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelButton({ applicationId }: { applicationId: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/applications/${applicationId}/cancel`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? "취소에 실패했습니다.");
      return;
    }
    router.refresh();
  }

  if (error) return <span className="text-sm text-err">{error}</span>;

  return confirming ? (
    <span className="flex flex-none items-center gap-2 text-sm">
      <button onClick={cancel} disabled={loading} className="font-bold text-err hover:underline">
        {loading ? "취소 중..." : "취소 확정"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-muted hover:underline">
        돌아가기
      </button>
    </span>
  ) : (
    <button
      onClick={() => setConfirming(true)}
      className="flex-none text-sm font-bold text-muted hover:text-err hover:underline"
    >
      지원 취소
    </button>
  );
}
