import { Button } from "./button";

export function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="grid justify-items-center gap-1.5 rounded-(--radius-card) border border-dashed border-line bg-surface px-6 py-14 text-center">
      <p className="text-lg font-bold">{title}</p>
      {desc && <p className="text-[15px] text-muted">{desc}</p>}
    </div>
  );
}

export function ErrorState({
  message = "잠시 후 다시 시도해 주세요.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="grid justify-items-center gap-3 rounded-(--radius-card) border border-line bg-surface px-6 py-14 text-center">
      <p className="text-lg font-bold text-err">불러오지 못했습니다</p>
      <p className="text-[15px] text-muted">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div aria-hidden className="grid animate-pulse gap-2.5 rounded-(--radius-card) border border-line bg-surface p-4">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={`h-4 rounded bg-line ${i === 0 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}
