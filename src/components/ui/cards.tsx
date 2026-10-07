import Link from "next/link";
import { Badge } from "./badge";
import {
  type AnnouncementView,
  dDay,
  genderLabel,
  isRecruiting,
  targetLabel,
} from "@/lib/announcement-view";

export function TrialCard({ trial }: { trial: AnnouncementView }) {
  const recruiting = isRecruiting(trial);
  return (
    <Link
      href={`/trials/${trial.id}`}
      className="grid gap-2 rounded-(--radius-card) border border-line bg-surface p-4 transition hover:border-primary"
    >
      <div className="flex items-center justify-between gap-2">
        <Badge tone={recruiting ? "open" : "closed"}>{recruiting ? "모집중" : "마감"}</Badge>
        {recruiting && (
          <span className="text-sm font-bold text-accent tabular-nums">D-{dDay(trial.recruitEnd)}</span>
        )}
      </div>
      <h3 className="text-[17px] leading-relaxed font-bold text-balance">{trial.title}</h3>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-sm text-muted">
        <span>{trial.institutionName}</span>
        <span>{trial.institutionAddress}</span>
        <span>
          만 {trial.ageMin}~{trial.ageMax}세 · {genderLabel[trial.gender]}
        </span>
      </div>
    </Link>
  );
}

export function SummaryCard({ trial }: { trial: AnnouncementView }) {
  const rows: Array<[string, string]> = [
    ["대상", `만 ${trial.ageMin}~${trial.ageMax}세 · ${genderLabel[trial.gender]} · ${targetLabel[trial.target]}`],
    ["모집기간", `${trial.recruitStart} ~ ${trial.recruitEnd}`],
    ["참여기간", trial.participationText ?? "공고 본문 참조"],
    ["실시기관", `${trial.institutionName} (${trial.institutionAddress})`],
  ];
  if (trial.targetCount) rows.push(["모집인원", `${trial.targetCount}명`]);
  if (trial.sponsorName) rows.push(["의뢰기관", trial.sponsorName]);
  return (
    <dl className="grid gap-2.5 rounded-(--radius-card) border border-line bg-bg p-4">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-3 text-[15px]">
          <dt className="w-20 flex-none text-muted">{k}</dt>
          <dd className="font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StatTile({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="grid gap-1 rounded-(--radius-card) border border-line bg-surface p-4">
      <span className="text-sm text-muted">{label}</span>
      <span className={`text-3xl font-black tabular-nums ${accent ? "text-accent" : ""}`}>{value}</span>
      {sub && <span className="text-sm text-muted">{sub}</span>}
    </div>
  );
}

export function ListRow({
  badge,
  title,
  desc,
  actions,
}: {
  badge?: React.ReactNode;
  title: string;
  desc?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-(--radius-card) border border-line bg-surface px-4 py-3.5">
      {badge}
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-base font-bold">{title}</h4>
        {desc && <p className="mt-0.5 text-sm text-muted">{desc}</p>}
      </div>
      {actions && <div className="flex flex-none gap-2">{actions}</div>}
    </div>
  );
}
