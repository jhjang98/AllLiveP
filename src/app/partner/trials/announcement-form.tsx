"use client";

// PTR-05 공고 작성·수정 공용 폼 — 기준 패턴: 폼

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AgreeItem, FormField } from "@/components/ui/form";

const inputCls =
  "min-h-12 w-full rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-base";

export interface CodeOption {
  id: number;
  name: string;
}

export interface FormValues {
  title: string;
  protocolNo: string;
  sponsorName: string;
  clinicalStepId: string;
  indicationCodeIds: number[];
  target: string;
  gender: string;
  ageMin: string;
  ageMax: string;
  targetCount: string;
  recruitStart: string;
  recruitEnd: string;
  participationText: string;
  body: string;
  readingPeriodMonths: string;
  sensitiveConsentRequired: boolean;
}

export const emptyValues: FormValues = {
  title: "",
  protocolNo: "",
  sponsorName: "",
  clinicalStepId: "",
  indicationCodeIds: [],
  target: "all",
  gender: "any",
  ageMin: "19",
  ageMax: "99",
  targetCount: "",
  recruitStart: "",
  recruitEnd: "",
  participationText: "",
  body: "",
  readingPeriodMonths: "36",
  sensitiveConsentRequired: false,
};

export function AnnouncementForm({
  mode,
  announcementId,
  initial,
  indicationOptions,
  clinicalStepOptions,
}: {
  mode: "create" | "edit";
  announcementId?: number;
  initial: FormValues;
  indicationOptions: CodeOption[];
  clinicalStepOptions: CodeOption[];
}) {
  const router = useRouter();
  const [v, setV] = useState<FormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof FormValues>(k: K, val: FormValues[K]) => setV((p) => ({ ...p, [k]: val }));

  function toggleIndication(id: number) {
    setV((p) => {
      const has = p.indicationCodeIds.includes(id);
      if (has) return { ...p, indicationCodeIds: p.indicationCodeIds.filter((x) => x !== id) };
      if (p.indicationCodeIds.length >= 3) return p;
      return { ...p, indicationCodeIds: [...p.indicationCodeIds, id] };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        mode === "create" ? "/api/partner/announcements" : `/api/partner/announcements/${announcementId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...v,
            clinicalStepId: v.clinicalStepId || null,
            ageMin: Number(v.ageMin),
            ageMax: Number(v.ageMax),
            targetCount: v.targetCount || null,
            readingPeriodMonths: Number(v.readingPeriodMonths),
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "저장에 실패했습니다.");
        return;
      }
      router.push(`/partner/trials/${data.id ?? announcementId}`);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <h1 className="text-2xl font-black">{mode === "create" ? "새 공고 작성" : "공고 수정"}</h1>
      <p className="-mt-3 text-[15px] text-muted">
        저장하면 "작성 중" 상태로 보관되고, 검수 제출 후 관리자 승인을 거쳐 게시됩니다.
      </p>

      <FormField label="공고 제목" required hint="참여자에게 보이는 제목입니다">
        <input id="ann-title" value={v.title} onChange={(e) => set("title", e.target.value)} required className={inputCls} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="프로토콜 번호">
          <input id="ann-protocol" value={v.protocolNo} onChange={(e) => set("protocolNo", e.target.value)} className={inputCls} />
        </FormField>
        <FormField label="의뢰기관(스폰서)">
          <input id="ann-sponsor" value={v.sponsorName} onChange={(e) => set("sponsorName", e.target.value)} className={inputCls} />
        </FormField>
      </div>

      <FormField label="적응증 (1~3개)" required>
        <div className="flex flex-wrap gap-2">
          {indicationOptions.map((c) => {
            const on = v.indicationCodeIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleIndication(c.id)}
                className={`min-h-10 rounded-full border px-4 py-1.5 text-sm transition ${
                  on ? "border-primary bg-primary font-bold text-white" : "border-line bg-surface hover:border-primary"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="임상 단계">
          <select id="ann-step" value={v.clinicalStepId} onChange={(e) => set("clinicalStepId", e.target.value)} className={inputCls}>
            <option value="">선택 안 함</option>
            {clinicalStepOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="모집 대상" required>
          <select id="ann-target" value={v.target} onChange={(e) => set("target", e.target.value)} className={inputCls}>
            <option value="patient">질환자</option>
            <option value="healthy">건강인</option>
            <option value="all">모두</option>
          </select>
        </FormField>
        <FormField label="성별" required>
          <select id="ann-gender" value={v.gender} onChange={(e) => set("gender", e.target.value)} className={inputCls}>
            <option value="any">무관</option>
            <option value="female">여성</option>
            <option value="male">남성</option>
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="나이 (만, 최소)" required>
          <input id="ann-agemin" type="number" min={0} max={120} value={v.ageMin} onChange={(e) => set("ageMin", e.target.value)} required className={inputCls} />
        </FormField>
        <FormField label="나이 (만, 최대)" required>
          <input id="ann-agemax" type="number" min={0} max={120} value={v.ageMax} onChange={(e) => set("ageMax", e.target.value)} required className={inputCls} />
        </FormField>
        <FormField label="목표 인원">
          <input id="ann-count" type="number" min={1} value={v.targetCount} onChange={(e) => set("targetCount", e.target.value)} className={inputCls} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="모집 시작일" required>
          <input id="ann-start" type="date" value={v.recruitStart} onChange={(e) => set("recruitStart", e.target.value)} required className={inputCls} />
        </FormField>
        <FormField label="모집 종료일" required>
          <input id="ann-end" type="date" value={v.recruitEnd} onChange={(e) => set("recruitEnd", e.target.value)} required className={inputCls} />
        </FormField>
      </div>

      <FormField label="참여 기간 안내" hint='예: "외래 방문 4회 (약 8주)"'>
        <input id="ann-period" value={v.participationText} onChange={(e) => set("participationText", e.target.value)} className={inputCls} />
      </FormField>

      <FormField label="시험 설명" required hint="사례비·절차 등 안내를 자유롭게 작성 (20자 이상)">
        <textarea
          id="ann-body"
          rows={10}
          value={v.body}
          onChange={(e) => set("body", e.target.value)}
          required
          className="w-full rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 py-2.5 text-base leading-relaxed"
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="지원자 열람가능기간" required hint="모집 종료 후 지원자 정보를 열람할 수 있는 기간">
          <select id="ann-reading" value={v.readingPeriodMonths} onChange={(e) => set("readingPeriodMonths", e.target.value)} className={inputCls}>
            <option value="36">3년</option>
            <option value="60">5년</option>
            <option value="120">10년</option>
          </select>
        </FormField>
        <div className="self-end">
          <AgreeItem checked={v.sensitiveConsentRequired} onChange={(x) => set("sensitiveConsentRequired", x)}>
            지원 시 민감정보(건강정보) 동의를 필수로 받습니다
          </AgreeItem>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm font-bold text-err">
          {error}
        </p>
      )}

      <Button type="submit" full disabled={loading}>
        {loading ? "저장 중..." : mode === "create" ? "저장 (작성 중 상태)" : "수정 저장"}
      </Button>
    </form>
  );
}
