// PTR-01 기관 가입 신청 — 이미 신청/승인된 기관이 있으면(반려 제외) /partner로

import { redirect } from "next/navigation";
import { getMyInstitution } from "@/lib/institution";
import { createServerSupabase } from "@/lib/supabase/server";
import { SignupForm } from "./signup-form";

export const metadata = { title: "기관 가입 신청" };

export default async function PartnerSignupPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/partner/signup");

  const inst = await getMyInstitution(user.id);
  if (inst && inst.status !== "rejected") redirect("/partner");

  return (
    <SignupForm
      resubmission={inst?.status === "rejected"}
      rejectReason={inst?.statusReason ?? null}
      defaults={
        inst
          ? {
              name: inst.name,
              bizRegNo: inst.bizRegNo,
              phone: inst.phone ?? "",
              address: inst.address ?? "",
              addressDetail: inst.addressDetail ?? "",
            }
          : null
      }
    />
  );
}
