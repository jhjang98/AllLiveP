// ADM-08 콘텐츠 관리 — 공지·FAQ 작성·게시 토글

import { createAdminClient } from "@/lib/supabase/admin";
import { ContentManager } from "./content-manager";

export const metadata = { title: "콘텐츠 관리" };

export default async function AdminContentsPage() {
  const db = createAdminClient();
  const [{ data: notices }, { data: faqs }] = await Promise.all([
    db.from("notices").select("id, title, body, published, created_at").order("created_at", { ascending: false }).limit(50),
    db.from("faqs").select("id, category, question, answer, sort, published").order("sort").limit(100),
  ]);

  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-black">콘텐츠 관리</h1>
      <ContentManager notices={notices ?? []} faqs={faqs ?? []} />
    </div>
  );
}
