"use client";

// 공고 썸네일 등록·교체 — 홈 배너·목록에 노출됨. 재검수 없이 즉시 반영(경미 수정)

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThumbnailUploader({
  announcementId,
  currentUrl,
}: {
  announcementId: number;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("thumbnail", file);
      const res = await fetch(`/api/partner/announcements/${announcementId}/thumbnail`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error?.message ?? "업로드에 실패했습니다.");
        return;
      }
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2.5 rounded-(--radius-card) border border-line bg-surface p-4">
      <h2 className="text-base font-bold">배너 이미지 (썸네일)</h2>
      <p className="text-sm text-muted">
        홈 상단 슬라이드와 공고에 노출됩니다. 권장 1200×720(5:3), JPG/PNG/WebP 5MB 이하. 없으면 분야별
        기본 그래픽이 표시됩니다.
      </p>
      {currentUrl && (
        <Image
          src={currentUrl}
          alt="현재 썸네일"
          width={400}
          height={240}
          className="h-36 w-60 rounded-(--radius-btn) border border-line object-cover"
        />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={`thumb-${announcementId}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-[15px] file:mr-3 file:min-h-10 file:rounded-(--radius-btn) file:border-0 file:bg-primary-soft file:px-4 file:font-bold file:text-primary-deep"
        />
        <Button onClick={upload} disabled={loading || !file} className="!min-h-10 !px-4 !text-[15px]">
          {loading ? "업로드 중..." : currentUrl ? "교체" : "업로드"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm font-bold text-err">
          {error}
        </p>
      )}
    </div>
  );
}
