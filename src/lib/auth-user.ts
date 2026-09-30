import "server-only";

import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

// Route Handler용 인증 확인: 브라우저는 세션 쿠키, API 클라이언트(테스트 포함)는 Bearer 토큰
export async function getAuthUser(request: Request): Promise<User | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user;

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!bearer) return null;
  const admin = createAdminClient();
  const { data } = await admin.auth.getUser(bearer);
  return data.user ?? null;
}

export function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}
