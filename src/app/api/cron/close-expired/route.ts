// POST /api/cron/close-expired — 모집기간 경과 공고 자동 마감 (R-A02)
// Vercel Cron 또는 수동 호출. CRON_SECRET으로 보호.

import { jsonError } from "@/lib/auth-user";
import { kstToday } from "@/lib/kst";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return jsonError(503, "not_configured", "CRON_SECRET이 설정되지 않았습니다.");
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return jsonError(401, "unauthorized", "인증이 필요합니다.");

  const db = createAdminClient();
  const { data, error } = await db
    .from("announcements")
    .update({ status: "closed" })
    .eq("status", "approved")
    .lt("recruit_end", kstToday())
    .select("id");
  if (error) return jsonError(500, "server_error", error.message);

  return Response.json({ closed: data?.length ?? 0 });
}
