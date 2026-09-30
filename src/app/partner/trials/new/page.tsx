import { redirect } from "next/navigation";
import { getMyInstitution } from "@/lib/institution";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { AnnouncementForm, emptyValues } from "../announcement-form";

export const metadata = { title: "새 공고 작성" };

export default async function NewAnnouncementPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/partner/trials/new");
  const inst = await getMyInstitution(user.id);
  if (!inst || inst.status !== "approved") redirect("/partner");

  const db = createAdminClient();
  const { data: codes } = await db
    .from("codes")
    .select("id, name, type")
    .in("type", ["interest", "clinical_step"])
    .eq("active", true)
    .order("sort");

  return (
    <AnnouncementForm
      mode="create"
      initial={emptyValues}
      indicationOptions={(codes ?? []).filter((c) => c.type === "interest")}
      clinicalStepOptions={(codes ?? []).filter((c) => c.type === "clinical_step")}
    />
  );
}
