// POST /api/admin/contents — 공지·FAQ 생성 (ADM-08)
// body: { kind: "notice"|"faq", ... }

import { getAdminUser, jsonError } from "@/lib/auth-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const admin = await getAdminUser(request);
  if (!admin) return jsonError(403, "forbidden", "관리자만 사용할 수 있습니다.");

  const body = await request.json().catch(() => null);
  const kind = body?.kind;
  const db = createAdminClient();

  if (kind === "notice") {
    const title = String(body?.title ?? "").trim();
    const content = String(body?.body ?? "").trim();
    if (!title || !content) return jsonError(400, "invalid_request", "제목과 내용을 입력해 주세요.");
    const { data, error } = await db
      .from("notices")
      .insert({ title, body: content, created_by: admin.id, published: body?.published !== false })
      .select("id")
      .single();
    if (error) return jsonError(500, "server_error", "저장에 실패했습니다.");
    return Response.json({ id: data.id }, { status: 201 });
  }

  if (kind === "faq") {
    const question = String(body?.question ?? "").trim();
    const answer = String(body?.answer ?? "").trim();
    if (!question || !answer) return jsonError(400, "invalid_request", "질문과 답변을 입력해 주세요.");
    const { data, error } = await db
      .from("faqs")
      .insert({
        category: String(body?.category ?? "").trim() || null,
        question,
        answer,
        sort: Number.isInteger(Number(body?.sort)) ? Number(body.sort) : 0,
        published: body?.published !== false,
      })
      .select("id")
      .single();
    if (error) return jsonError(500, "server_error", "저장에 실패했습니다.");
    return Response.json({ id: data.id }, { status: 201 });
  }

  return jsonError(400, "invalid_kind", "잘못된 콘텐츠 유형입니다.");
}

// PATCH /api/admin/contents — 수정·게시 토글. body: { kind, id, ...patch }
export async function PATCH(request: Request) {
  const admin = await getAdminUser(request);
  if (!admin) return jsonError(403, "forbidden", "관리자만 사용할 수 있습니다.");

  const body = await request.json().catch(() => null);
  const kind = body?.kind;
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) return jsonError(400, "invalid_request", "잘못된 요청입니다.");
  const db = createAdminClient();

  const patch: Record<string, unknown> = {};
  if (typeof body?.published === "boolean") patch.published = body.published;

  if (kind === "notice") {
    if (typeof body?.title === "string" && body.title.trim()) patch.title = body.title.trim();
    if (typeof body?.body === "string" && body.body.trim()) patch.body = body.body.trim();
  } else if (kind === "faq") {
    if (typeof body?.question === "string" && body.question.trim()) patch.question = body.question.trim();
    if (typeof body?.answer === "string" && body.answer.trim()) patch.answer = body.answer.trim();
    if (typeof body?.category === "string") patch.category = body.category.trim() || null;
    if (typeof body?.sort === "number" && Number.isInteger(body.sort)) patch.sort = body.sort;
  } else {
    return jsonError(400, "invalid_kind", "잘못된 콘텐츠 유형입니다.");
  }
  if (Object.keys(patch).length === 0) return jsonError(400, "empty_patch", "변경할 내용이 없습니다.");

  const table = kind === "notice" ? "notices" : "faqs";
  const { data, error } = await db.from(table).update(patch).eq("id", id).select("id");
  if (error) return jsonError(500, "server_error", "저장에 실패했습니다.");
  if (!data || data.length === 0) return jsonError(404, "not_found", "대상을 찾을 수 없습니다.");
  return Response.json({ id });
}
