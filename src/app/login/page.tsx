"use client";

// 로그인 — 기준 패턴: 폼 (참조: trials/[id]/apply)
// 기관 유형으로 가입한 계정은 따로 갈 곳이 없으면 /partner로 보낸다 (기관 미신청이면 신청 화면으로 이어짐)

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { safeNext } from "@/lib/nav";
import { createClient } from "@/lib/supabase/client";

const NOTICES: Record<string, { text: string; tone: "info" | "err" }> = {
  verify_check: {
    text: "인증 링크를 처리하지 못했습니다. 이미 인증을 마쳤다면 로그인해 주세요. 로그인이 안 되면 가입할 때 쓴 브라우저에서 메일의 링크를 다시 열어 주세요.",
    tone: "info",
  },
  link_invalid: { text: "인증 링크가 만료되었거나 올바르지 않습니다. 다시 가입하거나 로그인해 주세요.", tone: "err" },
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next");
  const next = safeNext(rawNext);
  const notice = NOTICES[params.get("notice") ?? ""];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(
          error.message.includes("not confirmed")
            ? "이메일 인증이 아직 완료되지 않았습니다. 받은 메일의 링크를 눌러 주세요."
            : "이메일 또는 비밀번호가 올바르지 않습니다.",
        );
        return;
      }
      const institutionIntent = data.user?.user_metadata?.account_type === "institution";
      router.push(!rawNext && institutionIntent ? "/partner" : next);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-md gap-5 py-6">
      <h1 className="text-2xl font-black">로그인</h1>
      {notice && (
        <p
          role="status"
          className={`rounded-(--radius-card) border px-4 py-3 text-[15px] ${
            notice.tone === "info" ? "border-line bg-surface text-ink" : "border-err text-err"
          }`}
        >
          {notice.text}
        </p>
      )}
      <FormField label="이메일" required>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-12 rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-base"
        />
      </FormField>
      <FormField label="비밀번호" required error={error ?? undefined}>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-12 rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-base"
        />
      </FormField>
      <Button type="submit" full disabled={loading}>
        {loading ? "확인 중..." : "로그인"}
      </Button>
      <div className="grid gap-1 text-center text-[15px] text-muted">
        <p>
          처음이신가요?{" "}
          <Link href="/signup" className="font-bold text-primary underline">
            회원가입
          </Link>
        </p>
        <p>
          병원·기관이신가요?{" "}
          <Link href="/partner-intro" className="font-bold text-primary underline">
            기관 등록 안내
          </Link>
        </p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
