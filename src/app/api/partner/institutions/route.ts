// POST /api/partner/institutions — 기관 가입 신청 (REQ-020, REQ-024)
// multipart/form-data: name, bizRegNo, phone, address, addressDetail?, cert(파일)
// E-I02: 동일 사업자등록번호 중복 차단. E-I03: 반려 상태면 재신청(갱신) 허용.

import { randomUUID } from "node:crypto";
import { getAuthUser, jsonError } from "@/lib/auth-user";
import { getMyInstitution } from "@/lib/institution";
import { notifyEmail } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return jsonError(401, "unauthorized", "로그인이 필요합니다.");

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError(400, "invalid_request", "잘못된 요청입니다.");

  const name = String(form.get("name") ?? "").trim();
  const bizRegNo = String(form.get("bizRegNo") ?? "").replaceAll("-", "");
  const phone = String(form.get("phone") ?? "").trim();
  const address = String(form.get("address") ?? "").trim();
  const addressDetail = String(form.get("addressDetail") ?? "").trim();
  const cert = form.get("cert");

  if (name.length < 2) return jsonError(400, "invalid_name", "기관명을 입력해 주세요.");
  if (!/^\d{10}$/.test(bizRegNo)) return jsonError(400, "invalid_bizregno", "사업자등록번호 10자리를 확인해 주세요.");
  if (!phone || !address) return jsonError(400, "invalid_request", "연락처와 주소를 입력해 주세요.");
  if (!(cert instanceof File) || cert.size === 0)
    return jsonError(400, "cert_required", "사업자등록증 파일을 첨부해 주세요.");
  const ext = ALLOWED_TYPES[cert.type];
  if (!ext) return jsonError(400, "cert_type", "사업자등록증은 PDF/JPG/PNG만 가능합니다.");
  if (cert.size > MAX_SIZE) return jsonError(400, "cert_size", "파일은 10MB 이하여야 합니다.");

  const db = createAdminClient();

  // 기존 소속 확인 — 반려 상태만 재신청 허용 (E-I03)
  const mine = await getMyInstitution(user.id);
  if (mine && mine.status !== "rejected")
    return jsonError(409, "already_member", "이미 기관 계정이 있습니다.");

  // 사업자번호 중복 (E-I02) — 타인 기관이면 차단
  const { data: dup } = await db
    .from("institutions")
    .select("id")
    .eq("biz_reg_no", bizRegNo)
    .maybeSingle();
  if (dup && dup.id !== mine?.id)
    return jsonError(409, "duplicate_bizregno", "이미 등록된 사업자등록번호입니다. 기관 담당자에게 문의해 주세요.");

  // 증빙 업로드 (비공개 버킷, 서버 전용)
  const path = `${user.id}/${randomUUID()}.${ext}`;
  const { error: upErr } = await db.storage
    .from("certs")
    .upload(path, Buffer.from(await cert.arrayBuffer()), { contentType: cert.type });
  if (upErr) return jsonError(500, "upload_failed", "파일 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");

  const fields = {
    name,
    biz_reg_no: bizRegNo,
    biz_cert_path: path,
    phone,
    address,
    address_detail: addressDetail || null,
    status: "pending" as const,
    status_reason: null,
    reviewed_by: null,
    reviewed_at: null,
  };

  let institutionId: number;
  if (mine) {
    // 반려 후 재신청: 기존 레코드 갱신 (반려 이력은 notifications에 남음)
    const { error } = await db.from("institutions").update(fields).eq("id", mine.id);
    if (error) {
      await db.storage.from("certs").remove([path]);
      if (error.code === "23505")
        return jsonError(409, "duplicate_bizregno", "이미 등록된 사업자등록번호입니다.");
      return jsonError(500, "server_error", "신청 처리에 실패했습니다.");
    }
    institutionId = mine.id;
    // 이전 증빙(개인정보) 삭제 — 실패는 치명적이지 않으므로 기록만
    if (mine.bizCertPath && mine.bizCertPath !== path) {
      const { error: rmErr } = await db.storage.from("certs").remove([mine.bizCertPath]);
      if (rmErr) console.warn(`[certs] 이전 증빙 삭제 실패: ${mine.bizCertPath}`);
    }
  } else {
    const { data, error } = await db.from("institutions").insert(fields).select("id").single();
    if (error) {
      await db.storage.from("certs").remove([path]);
      if (error.code === "23505")
        return jsonError(409, "duplicate_bizregno", "이미 등록된 사업자등록번호입니다.");
      return jsonError(500, "server_error", "신청 처리에 실패했습니다.");
    }
    institutionId = data.id;
    const { error: memberErr } = await db
      .from("institution_members")
      .insert({ institution_id: institutionId, profile_id: user.id });
    if (memberErr) {
      // 고아 기관 방지: 롤백 후 실패 응답 (사업자번호가 영구히 잠기는 것 방지)
      await db.from("institutions").delete().eq("id", institutionId);
      await db.storage.from("certs").remove([path]);
      return jsonError(500, "server_error", "신청 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
    const { error: roleErr } = await db.from("profiles").update({ role: "institution" }).eq("id", user.id);
    if (roleErr) console.warn(`[institutions] role 갱신 실패 user=${user.id}: ${roleErr.message}`);
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (adminEmail) {
    await notifyEmail(adminEmail, "institution_signup_requested", {
      institutionId,
      name,
      resubmission: Boolean(mine),
    });
  } else {
    console.warn("[institutions] ADMIN_EMAIL 미설정 — 가입 신청 알림을 보내지 못했습니다");
  }

  return Response.json({ id: institutionId, status: "pending" }, { status: 201 });
}
