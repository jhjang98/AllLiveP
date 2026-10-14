// PUB-13 기관 입점 안내 — 신청 절차·필요 서류·유의사항, 로그인 상태별 신청 버튼

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "기관 입점 안내" };

const STEPS = [
  {
    title: "담당자 계정 만들기",
    desc: "회원가입에서 \"병원·기관\"을 선택하고 담당자 이메일로 가입한 뒤, 받은 메일의 링크로 인증합니다.",
  },
  {
    title: "기관 정보 제출",
    desc: "기관명, 사업자등록번호, 대표 연락처, 주소와 사업자등록증 파일을 제출합니다.",
  },
  {
    title: "관리자 승인",
    desc: "플랫폼 관리자가 제출 서류를 확인합니다. 결과는 이메일로 알려드리며, 반려되면 사유를 확인하고 수정해 다시 신청할 수 있습니다.",
  },
  {
    title: "공고 등록과 검수",
    desc: "승인되면 모집공고를 작성해 검수를 요청합니다. 관리자 검수를 통과한 공고만 사이트에 게시됩니다.",
  },
];

const FEATURES = [
  { title: "공고 직접 등록", desc: "모집 조건·기간·설명과 배너 이미지를 기관이 직접 관리합니다." },
  { title: "지원자 바로 확인", desc: "지원자 목록을 보고 연락·선정·미선정 상태를 직접 처리합니다." },
  { title: "개인정보 보호", desc: "지원자 정보는 열람할 때마다 기록이 남고, 열람 가능 기간이 지나면 차단됩니다." },
];

export default async function PartnerIntroPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let role: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = data?.role ?? "member";
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-10">
      <section className="grid gap-3 pt-4">
        <p className="text-sm font-bold tracking-wide text-primary">병원 · 임상시험센터</p>
        <h1 className="text-3xl leading-snug font-black text-balance">
          임상시험 참여자 모집, 기관이 직접 공고하고 관리하세요
        </h1>
        <p className="text-muted">
          AllLiveP는 승인된 병원·임상시험센터가 모집공고를 직접 등록하고 지원자를 확인하는 플랫폼입니다.
          공고 등록은 무료입니다.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="grid content-start gap-1.5 rounded-(--radius-card) border border-line bg-surface p-4">
            <h2 className="text-base font-bold text-primary-deep">{f.title}</h2>
            <p className="text-[15px] text-muted">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-bold">입점 절차</h2>
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

      <section className="grid gap-3">
        <h2 className="text-xl font-bold">준비 서류와 유의사항</h2>
        <ul className="grid gap-2 rounded-(--radius-card) border border-line bg-surface p-5 text-[15px] leading-relaxed">
          <li>
            <b>사업자등록증</b> — PDF, JPG, PNG 파일, 10MB 이하
          </li>
          <li>
            기관 계정은 <b>공고 관리 전용</b>입니다. 기관 계정으로는 임상시험에 지원할 수 없으니, 담당자가
            개인으로 지원하려면 다른 이메일로 일반회원 가입을 해 주세요.
          </li>
          <li>같은 사업자등록번호로는 한 번만 신청할 수 있습니다.</li>
        </ul>
      </section>

      <section className="grid justify-items-center gap-3 rounded-(--radius-card) bg-primary-soft px-5 py-8 text-center">
        {role === "institution" ? (
          <>
            <p className="font-bold text-primary-deep">이미 기관 계정으로 로그인되어 있습니다.</p>
            <ButtonLink href="/partner">기관회원 페이지로 이동</ButtonLink>
          </>
        ) : role === "admin" ? (
          <p className="font-bold text-primary-deep">관리자 계정입니다. 기관 신청은 관리자 → 기관 승인에서 확인하세요.</p>
        ) : role === "member" ? (
          <>
            <p className="max-w-md text-[15px] text-primary-deep">
              지금 로그인한 계정으로 신청하면 이 계정은 <b>기관 계정으로 바뀌고 지원 기능을 쓸 수 없게</b>
              됩니다. 기관용 이메일로 새로 가입하는 것을 권합니다.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/partner/signup">이 계정으로 기관 신청</ButtonLink>
              <form action="/auth/signout" method="post">
                <input type="hidden" name="next" value="/signup?type=institution" />
                <button type="submit" className="min-h-11 px-4 font-bold text-primary underline">
                  로그아웃 후 새로 가입
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <ButtonLink href="/signup?type=institution" variant="accent">
              기관 담당자로 가입하기
            </ButtonLink>
            <p className="text-[15px] text-primary-deep">
              이미 계정이 있나요?{" "}
              <Link href="/login?next=/partner/signup" className="font-bold underline">
                로그인 후 신청
              </Link>
            </p>
          </>
        )}
      </section>
    </div>
  );
}
