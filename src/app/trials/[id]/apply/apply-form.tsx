"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AgreeItem, FormField, StepBar, StickyCTA } from "@/components/ui/form";

export function ApplyForm({
  trialId,
  title,
  institutionName,
}: {
  trialId: number;
  title: string;
  institutionName: string;
}) {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeThirdParty, setAgreeThirdParty] = useState(false);
  const [agreeSensitive, setAgreeSensitive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto grid max-w-xl justify-items-center gap-4 py-14 text-center">
        <p className="text-2xl font-black text-ok">지원이 완료되었습니다</p>
        <p className="text-muted">기관 담당자가 확인 후 연락드립니다. (목업 — PR #4에서 실제 접수)</p>
        <Link href="/trials" className="font-bold text-primary underline">
          다른 공고 보기
        </Link>
      </div>
    );
  }

  const valid = city !== "" && district.trim() !== "" && agreePrivacy && agreeThirdParty;

  return (
    <form
      className="mx-auto grid max-w-xl gap-5"
      data-trial-id={trialId}
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) {
          setShowErrors(true);
          return;
        }
        setSubmitted(true);
      }}
    >
      <StepBar current={2} total={3} />
      <h1 className="text-2xl font-black">지원 정보를 확인해 주세요</h1>
      <p className="-mt-3 text-[15px] text-muted">{title}</p>

      <FormField label="이름 · 연락처" hint="본인확인이 완료된 정보입니다 (목업)">
        <div className="rounded-(--radius-btn) border-[1.5px] border-ok bg-surface px-3.5 py-3 text-base">
          김○○ · 010-1234-5678 ✓ SMS 인증됨
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
            <option>경기도</option>
            <option>인천광역시</option>
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

      <StickyCTA>
        <Button type="submit" variant="accent" full>
          동의하고 지원하기
        </Button>
      </StickyCTA>
    </form>
  );
}
