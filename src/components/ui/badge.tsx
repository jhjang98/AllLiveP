type Tone = "open" | "review" | "rejected" | "closed" | "dday";

const tones: Record<Tone, string> = {
  open: "bg-ok-soft text-ok",
  review: "bg-warn-soft text-warn",
  rejected: "bg-red-50 text-err",
  closed: "bg-gray-100 text-muted",
  dday: "bg-accent-soft text-accent",
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}
