import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

// 이메일 알림 (REQ-070). EMAIL_MODE=mock이면 발송 없이 notifications에 기록만 한다.
// 실발송(네이버웍스 SMTP)은 계정 수령 후 전환.
export async function notifyEmail(
  recipientEmail: string,
  template: string,
  payload: Record<string, unknown>,
) {
  const db = createAdminClient();
  const mock = process.env.EMAIL_MODE !== "live";
  const { error } = await db.from("notifications").insert({
    recipient_email: recipientEmail,
    template,
    payload,
    sent_at: mock ? new Date().toISOString() : null,
    error: mock ? "mock-mode" : null,
  });
  if (error) console.error(`[notify] 기록 실패 template=${template}: ${error.message}`);
  if (mock) console.log(`[notify:mock] ${template} → ${recipientEmail}`);
}
