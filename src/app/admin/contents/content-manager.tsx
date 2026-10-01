"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Notice {
  id: number;
  title: string;
  body: string;
  published: boolean;
  created_at: string;
}
interface Faq {
  id: number;
  category: string | null;
  question: string;
  answer: string;
  sort: number;
  published: boolean;
}

const inputCls = "min-h-11 w-full rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-[15px]";

export function ContentManager({ notices, faqs }: { notices: Notice[]; faqs: Faq[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"notice" | "faq">("notice");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(method: "POST" | "PATCH", payload: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/contents", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error?.message ?? "처리에 실패했습니다.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex gap-2">
        {(["notice", "faq"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`min-h-10 rounded-full border px-5 py-1.5 text-[15px] ${
              tab === t ? "border-primary bg-primary font-bold text-white" : "border-line bg-surface"
            }`}
          >
            {t === "notice" ? "공지사항" : "FAQ"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 rounded-(--radius-card) border border-line bg-surface p-4">
        {tab === "notice" ? (
          <>
            <input placeholder="공지 제목" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
            <textarea placeholder="내용" rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="w-full rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 py-2 text-[15px]" />
            <Button
              onClick={async () => {
                if (await call("POST", { kind: "notice", title, body })) {
                  setTitle("");
                  setBody("");
                }
              }}
              disabled={loading || !title.trim() || !body.trim()}
              className="justify-self-start"
            >
              공지 등록
            </Button>
          </>
        ) : (
          <>
            <input placeholder="질문" value={question} onChange={(e) => setQuestion(e.target.value)} className={inputCls} />
            <textarea placeholder="답변" rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 py-2 text-[15px]" />
            <Button
              onClick={async () => {
                if (await call("POST", { kind: "faq", question, answer })) {
                  setQuestion("");
                  setAnswer("");
                }
              }}
              disabled={loading || !question.trim() || !answer.trim()}
              className="justify-self-start"
            >
              FAQ 등록
            </Button>
          </>
        )}
        {error && <p className="text-sm font-bold text-err">{error}</p>}
      </div>

      {tab === "notice" ? (
        <div className="grid gap-2.5">
          {notices.map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-(--radius-card) border border-line bg-surface px-4 py-3">
              <Badge tone={n.published ? "open" : "closed"}>{n.published ? "게시" : "숨김"}</Badge>
              <span className="min-w-0 flex-1 truncate font-bold">{n.title}</span>
              <span className="text-sm text-muted">{new Date(n.created_at).toLocaleDateString("ko-KR")}</span>
              <button
                onClick={() => call("PATCH", { kind: "notice", id: n.id, published: !n.published })}
                disabled={loading}
                className="text-sm font-bold text-primary hover:underline"
              >
                {n.published ? "숨기기" : "게시"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2.5">
          {faqs.map((f) => (
            <div key={f.id} className="flex items-center gap-3 rounded-(--radius-card) border border-line bg-surface px-4 py-3">
              <Badge tone={f.published ? "open" : "closed"}>{f.published ? "게시" : "숨김"}</Badge>
              <span className="min-w-0 flex-1 truncate font-bold">{f.question}</span>
              <button
                onClick={() => call("PATCH", { kind: "faq", id: f.id, published: !f.published })}
                disabled={loading}
                className="text-sm font-bold text-primary hover:underline"
              >
                {f.published ? "숨기기" : "게시"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
