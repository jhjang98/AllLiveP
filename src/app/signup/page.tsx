"use client";

// 회원가입 (이메일) — 본인확인(SMS)은 지원 시점에 별도 진행 (docs/domain/member.md: unverified→active)

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AgreeItem, FormField } from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
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
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message.includes("already") ? "이미 가입된 이메일입니다." : "가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto grid max-w-md justify-items-center gap-3 py-14 text-center">
        <p className="text-2xl font-black text-ok">가입 요청 완료</p>
        <p className="text-muted">
          {email} 으로 확인 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료해 주세요.
        </p>
        <Link href="/login" className="font-bold text-primary underline">
          로그인으로
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-md gap-5 py-6">
      <h1 className="text-2xl font-black">회원가입</h1>
      <FormField label="이메일" required>
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
        {loading ? "처리 중..." : "가입하기"}
      </Button>
    </form>
  );
}
