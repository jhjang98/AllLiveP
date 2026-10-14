// PUB-11 참여 절차 안내 — 일반 사용자의 임상시험 지원 흐름, 진행 상태, 지원 규칙, 참여자 권리
// 단계·상태·규칙은 실제 구현(docs/domain/application.md, member.md)과 일치시킨다.

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "참여 절차" };

const STEPS = [
  {
    title: "공고 찾기",
    desc: "공고 찾기에서 질환 분야와 모집 조건(나이·성별·대상)을 확인하고 관심 있는 시험을 고릅니다.",
  },
  {
    title: "회원가입·로그인",
    desc: "이메일로 가입하고, 받은 메일의 링크를 눌러 인증한 뒤 로그인합니다.",
  },
  {
    title: "본인확인",
    desc: "처음 지원할 때 휴대폰 문자 인증으로 이름·연락처·성별·생년월일을 확인합니다. 한 번만 하면 됩니다.",
  },
  {
    title: "지원하기",
    desc: "공고의 '이 시험에 지원하기'를 눌러 거주 지역을 입력하고 동의 항목을 확인한 뒤 제출합니다. 접수 안내 메일이 발송됩니다.",
  },
  {
    title: "기관 검토와 연락",
    desc: "시험을 진행하는 병원·기관의 담당자가 지원 정보를 확인하고 연락드립니다. 진행 상황이 바뀌면 메일로 알려드립니다.",
  },
  {
    title: "방문 상담과 선정",
    desc: "기관 안내에 따라 방문해 시험 설명을 듣고, 참여 동의 후 선정 검사를 받습니다. 결과는 '내 지원'에서 확인할 수 있습니다.",
  },
];

const STATUSES: Array<{ label: string; tone: "open" | "review" | "closed"; desc: string }> = [
  { label: "접수됨", tone: "review", desc: "지원이 접수되어 기관 확인을 기다리는 중입니다." },
  { label: "기관 확인", tone: "review", desc: "기관 담당자가 지원 정보를 확인했습니다." },
  { label: "진행 중", tone: "open", desc: "기관이 연락·상담 등 선정 절차를 진행하고 있습니다." },
  { label: "선정", tone: "open", desc: "시험 참여 대상자로 선정되었습니다." },
  { label: "미선정", tone: "closed", desc: "이번 시험의 선정 기준에 맞지 않거나 모집이 끝났습니다." },
  { label: "취소함", tone: "closed", desc: "본인이 지원을 취소했습니다." },
];

const RULES = [
  "지원은 하루에 1건만 할 수 있습니다.",
  "같은 공고에는 한 번만 지원할 수 있으며, 취소한 공고에는 다시 지원할 수 없습니다.",
  "공고의 모집 나이·성별 조건에 맞아야 지원할 수 있습니다.",
  "지원 취소는 '내 지원'에서 선정 전까지 할 수 있습니다. 선정 후에는 기관에 직접 문의해 주세요.",
  "지원하면 입력한 정보가 해당 시험을 진행하는 기관에만 제공됩니다. 기관의 정보 열람은 모두 기록됩니다.",
];

export default function GuidePage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-10">
      <section className="grid gap-3 pt-4">
        <p className="text-sm font-bold tracking-wide text-primary">일반 참여자 안내</p>
        <h1 className="text-3xl leading-snug font-black text-balance">임상시험 참여 절차</h1>
        <p className="text-muted">
          공고를 찾아 지원하면, 시험을 진행하는 병원·기관이 확인하고 연락드립니다. 지원은 무료이며 참여
          여부는 설명을 들은 뒤 직접 결정합니다.
        </p>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-bold">지원부터 선정까지</h2>
        <ol className="grid gap-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-(--radius-card) border border-line bg-surface p-4">
              <span className="flex size-9 flex-none items-center justify-center rounded-full bg-primary text-base font-bold text-white tabular-nums">
                {i + 1}
              </span>
              <div className="grid gap-1">
                <h3 className="text-base font-bold">{s.title}</h3>
                <p className="text-[15px] text-muted">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-bold">진행 상태 보는 법</h2>
        <p className="-mt-2 text-[15px] text-muted">
          <Link href="/me/applications" className="font-bold text-primary underline">
            내 지원
          </Link>
          에서 지원한 공고마다 아래 상태가 표시됩니다.
        </p>
        <dl className="grid gap-2 rounded-(--radius-card) border border-line bg-surface p-4">
          {STATUSES.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <dt className="w-24 flex-none">
                <Badge tone={s.tone}>{s.label}</Badge>
              </dt>
              <dd className="text-[15px]">{s.desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-bold">지원 전에 알아두세요</h2>
        <ul className="grid list-disc gap-2 rounded-(--radius-card) border border-line bg-surface py-5 pr-5 pl-9 text-[15px] leading-relaxed">
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-bold">참여자의 권리</h2>
        <div className="grid gap-2 rounded-(--radius-card) border border-line bg-surface p-5 text-[15px] leading-relaxed">
          <p>
            임상시험에 참여하기 전, 시험 담당자에게 목적·방법·예상되는 위험과 이익에 대해 충분히 설명을 듣고
            서면으로 동의한 경우에만 참여하게 됩니다.
          </p>
          <p>
            참여는 자발적이며, 동의한 뒤에도 <b>언제든지 참여를 그만둘 수 있고</b> 그로 인한 불이익은
            없습니다.
          </p>
          <p>
            참여 기간, 방문 횟수, 사례비 등은 시험마다 다릅니다. 공고의 시험 설명을 확인하고, 궁금한 점은
            상담할 때 기관에 문의해 주세요.
          </p>
        </div>
      </section>

      <section className="grid justify-items-center gap-3 rounded-(--radius-card) bg-primary-soft px-5 py-8 text-center">
        <p className="font-bold text-primary-deep">나에게 맞는 임상시험을 찾아보세요</p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/trials" variant="accent">
            공고 찾아보기
          </ButtonLink>
          <ButtonLink href="/faq" variant="outline">
            자주 묻는 질문
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
