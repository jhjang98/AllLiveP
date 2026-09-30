// 기준 페이지: 폼 — 로그인·본인확인 게이트 후 실제 지원 접수 (REQ-010, E-M01)

import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/states";
import { getAnnouncement, isRecruiting } from "@/lib/announcements";
import { createServerSupabase } from "@/lib/supabase/server";
import { ApplyForm } from "./apply-form";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trial = await getAnnouncement(Number(id));

  if (!trial || !isRecruiting(trial)) {
    return (
      <EmptyState title="지원할 수 없는 공고입니다" desc="모집이 마감되었거나 존재하지 않습니다." />
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/trials/${trial.id}/apply`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone, phone_verified_at")
    .eq("id", user.id)
    .single();
  if (!profile?.phone_verified_at) redirect(`/verify?next=/trials/${trial.id}/apply`);

  const maskedPhone = profile.phone
    ? `${profile.phone.slice(0, 3)}-****-${profile.phone.slice(-4)}`
    : "";

  return (
    <ApplyForm
      trialId={trial.id}
      title={trial.title}
      institutionName={trial.institutionName}
      memberName={profile.name ?? ""}
      memberPhone={maskedPhone}
    />
  );
}
