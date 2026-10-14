type Tone = "open" | "review" | "rejected" | "closed" | "dday" | "ended";

const tones: Record<Tone, string> = {
  open: "bg-ok-soft text-ok",
  review: "bg-warn-soft text-warn",
  rejected: "bg-red-50 text-err",
  closed: "bg-gray-100 text-muted",
  dday: "bg-accent-soft text-accent",
  // 공개 사이트의 모집마감 표시 — 모집중(그린)과 확실히 구분되는 진회색 바탕
  ended: "bg-muted text-white",
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}
