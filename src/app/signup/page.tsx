"use client";

// 회원가입 (이메일) — 가입 유형 선택: 일반회원 / 병원·기관
// 기관을 고르면 메일 인증 후 기관 신청 화면(/partner/signup)으로 바로 이어진다.
// 본인확인(SMS)은 일반회원이 지원하는 시점에 별도 진행 (docs/domain/member.md)

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { AgreeItem, FormField } from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";

type AccountType = "member" | "institution";

const TYPES: Array<{ value: AccountType; title: string; desc: string }> = [
  { value: "member", title: "일반회원", desc: "임상시험에 참여하고 싶어요" },
  { value: "institution", title: "병원·기관", desc: "모집공고를 등록하고 싶어요" },
];

function SignupForm() {
  const initialType: AccountType = useSearchParams().get("type") === "institution" ? "institution" : "member";
  const [type, setType] = useState<AccountType>(initialType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeService, setAgreeService] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreeService || !agreePrivacy) {
      setError("필수 약관에 동의해 주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = type === "institution" ? "/partner/signup" : "/";
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          data: { account_type: type },
        },
      });
      if (error) {
        setError(
          error.message.includes("already")
            ? "이미 가입된 이메일입니다."
            : "가입에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }
      setDone(true);
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto grid max-w-md justify-items-center gap-3 py-14 text-center">
        <p className="text-2xl font-black text-ok">가입 요청 완료</p>
        <p className="text-muted">
          {email} 으로 확인 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료해 주세요.
        </p>
        {type === "institution" && (
          <p className="rounded-(--radius-card) border border-line bg-surface px-4 py-3 text-[15px]">
            메일 인증 후 <b>기관 정보와 사업자등록증을 제출하는 화면</b>으로 이동합니다. 관리자 승인이
            끝나면 공고를 등록할 수 있습니다.
          </p>
        )}
        <Link href="/login" className="font-bold text-primary underline">
          로그인으로
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-md gap-5 py-6">
      <h1 className="text-2xl font-black">회원가입</h1>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-base font-bold">가입 유형</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {TYPES.map((t) => (
            <label
              key={t.value}
              className={`grid cursor-pointer gap-0.5 rounded-(--radius-card) border-[1.5px] px-4 py-3 transition ${
                type === t.value ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary"
              }`}
            >
              <input
                type="radio"
                name="account-type"
                value={t.value}
                checked={type === t.value}
                onChange={() => setType(t.value)}
                className="sr-only"
              />
              <span className={`text-base font-bold ${type === t.value ? "text-primary-deep" : ""}`}>{t.title}</span>
              <span className="text-sm text-muted">{t.desc}</span>
            </label>
          ))}
        </div>
        {type === "institution" && (
          <p className="text-sm text-muted">
            담당자 계정을 먼저 만든 뒤 기관 정보를 제출합니다. 기관 계정으로는 임상시험 지원을 할 수
            없으니, 개인으로 지원하려면 다른 이메일로 일반회원 가입을 해 주세요.{" "}
            <Link href="/partner-intro" className="font-bold text-primary underline">
              입점 안내 보기
            </Link>
          </p>
        )}
      </fieldset>

      <FormField label={type === "institution" ? "담당자 이메일" : "이메일"} required>
        <input
          id="signup-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-12 rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-base"
        />
      </FormField>
      <FormField label="비밀번호" required hint="8자 이상">
        <input
          id="signup-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-12 rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-base"
        />
      </FormField>
      <div className="grid gap-2.5">
        <AgreeItem checked={agreeService} onChange={setAgreeService} required>
          서비스 이용약관 동의
        </AgreeItem>
        <AgreeItem checked={agreePrivacy} onChange={setAgreePrivacy} required>
          개인정보 수집·이용 동의
        </AgreeItem>
      </div>
      {error && (
        <p role="alert" className="text-sm text-err">
          {error}
        </p>
      )}
      <Button type="submit" full disabled={loading}>
        {loading ? "처리 중..." : type === "institution" ? "담당자 계정 만들기" : "가입하기"}
      </Button>
      <p className="text-center text-[15px] text-muted">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-bold text-primary underline">
          로그인
        </Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
