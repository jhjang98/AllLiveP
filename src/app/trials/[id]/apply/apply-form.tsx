"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AgreeItem, FormField, StepBar, StickyCTA } from "@/components/ui/form";

export function ApplyForm({
  trialId,
  title,
  institutionName,
  memberName,
  memberPhone,
}: {
  trialId: number;
  title: string;
  institutionName: string;
  memberName: string;
  memberPhone: string;
}) {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeThirdParty, setAgreeThirdParty] = useState(false);
  const [agreeSensitive, setAgreeSensitive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto grid max-w-xl justify-items-center gap-4 py-14 text-center">
        <p className="text-2xl font-black text-ok">지원이 완료되었습니다</p>
        <p className="text-muted">기관 담당자가 확인 후 연락드립니다. 접수 안내 메일을 보냈습니다.</p>
        <Link href="/me/applications" className="font-bold text-primary underline">
          내 지원 내역 보기
        </Link>
      </div>
    );
  }

  const valid = city !== "" && district.trim() !== "" && agreePrivacy && agreeThirdParty;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setShowErrors(true);
      return;
    }
    setLoading(true);
    setApiError(null);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        announcementId: trialId,
        city,
        district,
        consentPrivacy: agreePrivacy,
        consentThirdParty: agreeThirdParty,
        consentSensitive: agreeSensitive,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setApiError(data?.error?.message ?? "지원 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <form className="mx-auto grid max-w-xl gap-5" onSubmit={submit}>
      <StepBar current={2} total={3} />
      <h1 className="text-2xl font-black">지원 정보를 확인해 주세요</h1>
      <p className="-mt-3 text-[15px] text-muted">{title}</p>

      <FormField label="이름 · 연락처" hint="본인확인이 완료된 정보입니다">
        <div className="rounded-(--radius-btn) border-[1.5px] border-ok bg-surface px-3.5 py-3 text-base">
          {memberName} · {memberPhone} ✓ 인증됨
        </div>
      </FormField>

      <FormField
        label="거주 지역"
        required
        error={showErrors && (!city || !district.trim()) ? "거주 지역을 선택해 주세요." : undefined}
      >
        <div className="grid grid-cols-2 gap-2">
          <select
            id="apply-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="min-h-12 rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-base"
          >
            <option value="">시·도 선택</option>
            <option>서울특별시</option>
            <option>부산광역시</option>
            <option>대구광역시</option>
            <option>인천광역시</option>
            <option>광주광역시</option>
            <option>대전광역시</option>
            <option>울산광역시</option>
            <option>세종특별자치시</option>
            <option>경기도</option>
            <option>강원특별자치도</option>
            <option>충청북도</option>
            <option>충청남도</option>
            <option>전북특별자치도</option>
            <option>전라남도</option>
            <option>경상북도</option>
            <option>경상남도</option>
            <option>제주특별자치도</option>
          </select>
          <input
            id="apply-district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="시·군·구"
            className="min-h-12 rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-base"
          />
        </div>
      </FormField>

      <div className="grid gap-2.5">
        <AgreeItem checked={agreePrivacy} onChange={setAgreePrivacy} required>
          개인정보 수집·이용 동의
        </AgreeItem>
        <AgreeItem checked={agreeThirdParty} onChange={setAgreeThirdParty} required>
          실시기관({institutionName}) 제3자 제공 동의
        </AgreeItem>
        <AgreeItem checked={agreeSensitive} onChange={setAgreeSensitive}>
          민감정보(건강정보) 수집 동의
        </AgreeItem>
        {showErrors && (!agreePrivacy || !agreeThirdParty) && (
          <p role="alert" className="text-sm text-err">
            필수 동의 항목에 체크해 주세요.
          </p>
        )}
      </div>

      {apiError && (
        <p role="alert" className="text-sm font-bold text-err">
          {apiError}
        </p>
      )}

      <StickyCTA>
        <Button type="submit" variant="accent" full disabled={loading}>
          {loading ? "접수 중..." : "동의하고 지원하기"}
        </Button>
      </StickyCTA>
    </form>
  );
}
