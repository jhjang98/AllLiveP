// 개발(stg) 픽스처: 기관회원 계정 + 승인된 기관 + 샘플 공고 3건
// 실행: node --env-file=.env.local scripts/seed-dev.mjs
// prod에는 사용하지 않는다.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("env가 없습니다 (.env.local)");
const db = createClient(url, key, { auth: { persistSession: false } });

const PARTNER_EMAIL = "partner-test@alllivep.local";

async function ensurePartnerUser() {
  const { data: list } = await db.auth.admin.listUsers({ perPage: 200 });
  let user = list.users.find((u) => u.email === PARTNER_EMAIL);
  if (!user) {
    const { data, error } = await db.auth.admin.createUser({
      email: PARTNER_EMAIL,
      password: "Partner!2345",
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  }
  await db.from("profiles").update({ role: "institution", name: "테스트담당자" }).eq("id", user.id);
  return user.id;
}

async function ensureInstitution(ownerId) {
  const { data: found } = await db.from("institutions").select("id").eq("biz_reg_no", "1234567890").maybeSingle();
  if (found) return found.id;
  const { data, error } = await db
    .from("institutions")
    .insert({
      name: "한빛대학교병원",
      biz_reg_no: "1234567890",
      biz_cert_path: "dev/placeholder.pdf",
      phone: "02-000-0000",
      address: "서울특별시 종로구",
      status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  await db.from("institution_members").insert({ institution_id: data.id, profile_id: ownerId });
  return data.id;
}

async function codeId(name) {
  const { data, error } = await db.from("codes").select("id").eq("name", name).maybeSingle();
  if (error) throw new Error(`코드 조회 실패(${name}): ${error.message}`);
  if (!data) throw new Error(`코드가 없습니다: "${name}" — supabase/seed.sql을 먼저 적용하세요`);
  return data.id;
}

async function seedAnnouncements(instId, ownerId) {
  const { count } = await db.from("announcements").select("id", { count: "exact", head: true });
  if (count > 0) {
    console.log(`announcements 이미 ${count}건 — 건너뜀`);
    return;
  }
  const step2 = await codeId("2상");
  const stepBE = await codeId("생물학적 동등성(BE)");
  const indoc = await codeId("내분비 (당뇨 등)");
  const healthy = await codeId("건강인");

  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const plus = (days) => iso(new Date(today.getTime() + days * 86400000));

  const rows = [
    {
      title: "제2형 당뇨병 환자 대상 경구용 치료제 유효성 평가",
      protocol_no: "HB-DM-2026-01",
      sponsor_name: "가상제약",
      clinical_step_id: step2,
      target: "patient",
      gender: "any",
      age_min: 19,
      age_max: 65,
      target_count: 30,
      recruit_start: iso(today),
      recruit_end: plus(60),
      participation_text: "외래 방문 4회 (약 8주)",
      body: "<p>경구용 혈당강하제의 유효성과 안전성을 평가하는 시험입니다. 참여 전 담당자가 선정 기준을 자세히 안내해 드립니다.</p>",
      status: "approved",
      reviewed_at: new Date().toISOString(),
      indications: [indoc],
    },
    {
      title: "건강한 성인 대상 생물학적 동등성 시험 (1박 2일 × 2회)",
      protocol_no: "HB-BE-2026-07",
      clinical_step_id: stepBE,
      target: "healthy",
      gender: "male",
      age_min: 19,
      age_max: 45,
      target_count: 24,
      recruit_start: iso(today),
      recruit_end: plus(27),
      participation_text: "1박 2일 입원 2회",
      body: "<p>제네릭 의약품의 생물학적 동등성을 확인하는 시험입니다.</p>",
      status: "approved",
      reviewed_at: new Date().toISOString(),
      indications: [healthy],
    },
    {
      title: "당뇨 전단계 성인 대상 식이 보조 연구",
      clinical_step_id: step2,
      target: "all",
      gender: "any",
      age_min: 30,
      age_max: 70,
      recruit_start: plus(-90),
      recruit_end: plus(-10),
      participation_text: "외래 2회",
      body: "<p>식이 보조 요법의 효과를 관찰하는 연구입니다.</p>",
      status: "closed",
      reviewed_at: new Date().toISOString(),
      indications: [indoc],
    },
  ];

  for (const { indications, ...row } of rows) {
    const { data, error } = await db
      .from("announcements")
      .insert({ ...row, institution_id: instId, created_by: ownerId })
      .select("id")
      .single();
    if (error) throw error;
    await db.from("announcement_indications").insert(indications.map((code_id) => ({ announcement_id: data.id, code_id })));
    console.log(`공고 #${data.id} — ${row.title}`);
  }
}

async function ensureAdminUser() {
  const { data: list } = await db.auth.admin.listUsers({ perPage: 200 });
  let user = list.users.find((u) => u.email === "admin-test@alllivep.local");
  if (!user) {
    const { data, error } = await db.auth.admin.createUser({
      email: "admin-test@alllivep.local",
      password: "Admin!2345",
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  }
  await db.from("profiles").update({ role: "admin", name: "테스트관리자" }).eq("id", user.id);
  return user.id;
}

console.log("admin user:", await ensureAdminUser());
const ownerId = await ensurePartnerUser();
console.log("partner user:", ownerId);
const instId = await ensureInstitution(ownerId);
console.log("institution:", instId);
await seedAnnouncements(instId, ownerId);
console.log("완료");
