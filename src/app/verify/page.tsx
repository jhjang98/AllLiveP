"use client";

// PUB-06 본인확인 — SMS 인증 (모의 모드: 응답의 devCode를 자동 입력해 개발 편의 제공)

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { safeNext } from "@/lib/nav";

const inputCls =
  "min-h-12 rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-base w-full";

function VerifyForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/phone/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "발송에 실패했습니다.");
        return;
      }
      setSent(true);
      if (data.devCode) setCode(data.devCode); // 모의 모드 개발 편의
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name, gender, birthDate }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "본인확인에 실패했습니다.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-md gap-5 py-6">
      <h1 className="text-2xl font-black">본인확인</h1>
      <p className="-mt-3 text-[15px] text-muted">임상시험 지원에는 휴대폰 본인확인이 필요합니다.</p>

      <FormField label="휴대폰 번호" required>
        <div className="flex gap-2">
          <input
            id="verify-phone"
            type="tel"
            placeholder="01012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
          />
          <Button type="button" variant="outline" onClick={requestCode} disabled={loading || phone.length < 10}>
            {sent ? "재발송" : "인증번호 발송"}
          </Button>
        </div>
      </FormField>

      {sent && (
        <>
          <FormField label="인증번호" required hint="문자로 받은 6자리 (모의 모드에서는 자동 입력)">
            <input
              id="verify-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputCls}
            />
          </FormField>
          <FormField label="이름" required>
            <input id="verify-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </FormField>
          <FormField label="성별" required>
            <select id="verify-gender" value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
              <option value="">선택</option>
              <option value="female">여성</option>
              <option value="male">남성</option>
            </select>
          </FormField>
          <FormField label="생년월일" required>
            <input
              id="verify-birth"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={inputCls}
            />
          </FormField>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-err">
          {error}
        </p>
      )}

      {sent && (
        <Button type="submit" full disabled={loading}>
          {loading ? "확인 중..." : "본인확인 완료"}
        </Button>
      )}
    </form>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
