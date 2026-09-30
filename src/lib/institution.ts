import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface MyInstitution {
  id: number;
  name: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  statusReason: string | null;
  bizRegNo: string;
  address: string | null;
  phone: string | null;
}

// 로그인 사용자가 속한 기관 (1차 버전: 기관당 담당자 1계정)
export async function getMyInstitution(userId: string): Promise<MyInstitution | null> {
  const db = createAdminClient();
  const { data } = await db
    .from("institution_members")
    .select("institutions ( id, name, status, status_reason, biz_reg_no, address, phone )")
    .eq("profile_id", userId)
    .limit(1)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inst = (data as any)?.institutions;
  if (!inst) return null;
  return {
    id: inst.id,
    name: inst.name,
    status: inst.status,
    statusReason: inst.status_reason,
    bizRegNo: inst.biz_reg_no,
    address: inst.address,
    phone: inst.phone,
  };
}
