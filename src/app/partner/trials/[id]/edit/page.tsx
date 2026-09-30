import { notFound, redirect } from "next/navigation";
import { getOwnedAnnouncement } from "@/lib/partner-announcements";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { AnnouncementForm, type FormValues } from "../../announcement-form";

export const metadata = { title: "공고 수정" };

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/partner/trials");

  const { id } = await params;
  const owned = await getOwnedAnnouncement(user.id, Number(id));
  if (owned.error === "institution") redirect("/partner");
  if (owned.error === "not_found") notFound();
  const ann = owned.announcement;
  if (ann.status === "closed") redirect(`/partner/trials/${ann.id}`);

  const db = createAdminClient();
  const [{ data: codes }, { data: inds }] = await Promise.all([
    db.from("codes").select("id, name, type").in("type", ["interest", "clinical_step"]).eq("active", true).order("sort"),
    db.from("announcement_indications").select("code_id").eq("announcement_id", ann.id),
  ]);

  const initial: FormValues = {
    title: ann.title,
    protocolNo: ann.protocol_no ?? "",
    sponsorName: ann.sponsor_name ?? "",
    clinicalStepId: ann.clinical_step_id ? String(ann.clinical_step_id) : "",
    indicationCodeIds: (inds ?? []).map((x) => x.code_id),
    target: ann.target,
    gender: ann.gender,
    ageMin: String(ann.age_min),
    ageMax: String(ann.age_max),
    targetCount: ann.target_count ? String(ann.target_count) : "",
    recruitStart: ann.recruit_start,
    recruitEnd: ann.recruit_end,
    participationText: ann.participation_text ?? "",
    body: ann.body,
    readingPeriodMonths: String(ann.reading_period_months),
    sensitiveConsentRequired: ann.sensitive_consent_required,
  };

  return (
    <div className="grid gap-4">
      {ann.status === "approved" && (
        <p className="rounded-(--radius-card) border border-line bg-warn-soft px-4 py-3 text-[15px] text-warn">
          게시 중인 공고입니다. 수정을 저장하면 <b>검수 대기 상태로 바뀌고 공개 목록에서 내려갑니다.</b>
        </p>
      )}
      <AnnouncementForm
        mode="edit"
        announcementId={ann.id}
        initial={initial}
        indicationOptions={(codes ?? []).filter((c) => c.type === "interest")}
        clinicalStepOptions={(codes ?? []).filter((c) => c.type === "clinical_step")}
      />
    </div>
  );
}
