"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AgreeItem, FormField } from "@/components/ui/form";

const inputCls =
  "min-h-12 w-full rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-base";

export function SignupForm({
  resubmission,
  rejectReason,
  defaults,
}: {
  resubmission: boolean;
  rejectReason: string | null;
  defaults: { name: string; bizRegNo: string; phone: string; address: string } | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaults?.name ?? "");
  const [bizRegNo, setBizRegNo] = useState(defaults?.bizRegNo ?? "");
  const [phone, setPhone] = useState(defaults?.phone ?? "");
  const [address, setAddress] = useState(defaults?.address ?? "");
  const [addressDetail, setAddressDetail] = useState("");
  const [cert, setCert] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!cert) {
      setError("사업자등록증 파일을 첨부해 주세요.");
      return;
    }
    if (!agree) {
      setError("확인 사항에 동의해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("bizRegNo", bizRegNo);
      form.set("phone", phone);
      form.set("address", address);
      form.set("addressDetail", addressDetail);
      form.set("cert", cert);
      const res = await fetch("/api/partner/institutions", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error?.message ?? "신청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      router.push("/partner");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto grid w-full max-w-xl gap-5 py-6">
      <h1 className="text-2xl font-black">{resubmission ? "기관 가입 재신청" : "기관 가입 신청"}</h1>
      <p className="-mt-3 text-[15px] text-muted">
        병원·임상시험센터 확인 후 승인해 드립니다. 승인되면 모집공고를 등록할 수 있습니다.
      </p>
      {resubmission && rejectReason && (
        <p className="rounded-(--radius-card) border border-line bg-surface px-4 py-3 text-[15px]">
          <b className="text-err">이전 반려 사유:</b> {rejectReason}
        </p>
      )}

      <FormField label="기관명" required>
        <input id="inst-name" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
      </FormField>
      <FormField label="사업자등록번호" required hint="숫자 10자리 (하이픈 없이)">
        <input
          id="inst-bizregno"
          inputMode="numeric"
          value={bizRegNo}
          onChange={(e) => setBizRegNo(e.target.value)}
          required
          className={inputCls}
        />
      </FormField>
      <FormField label="대표 연락처" required>
        <input id="inst-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} />
      </FormField>
      <FormField label="주소" required>
        <div className="grid gap-2">
          <input id="inst-address" value={address} onChange={(e) => setAddress(e.target.value)} required className={inputCls} />
          <input
            id="inst-address-detail"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            placeholder="상세 주소 (선택)"
            className={inputCls}
          />
        </div>
      </FormField>
      <FormField label="사업자등록증" required hint="PDF/JPG/PNG, 10MB 이하">
        <input
          id="inst-cert"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(e) => setCert(e.target.files?.[0] ?? null)}
          className="text-[15px] file:mr-3 file:min-h-10 file:rounded-(--radius-btn) file:border-0 file:bg-primary-soft file:px-4 file:font-bold file:text-primary-deep"
        />
      </FormField>

      <AgreeItem checked={agree} onChange={setAgree} required>
        제출한 정보가 사실이며, 확인을 위해 관리자가 증빙을 열람하는 것에 동의합니다.
      </AgreeItem>

      {error && (
        <p role="alert" className="text-sm font-bold text-err">
          {error}
        </p>
      )}

      <Button type="submit" full disabled={loading}>
        {loading ? "제출 중..." : resubmission ? "재신청하기" : "가입 신청하기"}
      </Button>
    </form>
  );
}
