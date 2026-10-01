"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Code {
  id: number;
  type: string;
  name: string;
  sort: number;
  active: boolean;
}

const typeLabel: Record<string, string> = {
  interest: "적응증 (관심분야)",
  clinical_step: "임상 단계",
  not_selected_reason: "미선정 사유",
  indication: "적응증 세부",
};

export function CodeManager({ codes }: { codes: Code[] }) {
  const router = useRouter();
  const [newType, setNewType] = useState("interest");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(method: string, url: string, body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  const groups = ["interest", "clinical_step", "not_selected_reason"];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end gap-2 rounded-(--radius-card) border border-line bg-surface p-4">
        <label className="grid gap-1 text-sm font-bold">
          유형
          <select value={newType} onChange={(e) => setNewType(e.target.value)} className="min-h-11 rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-2 text-[15px] font-normal">
            {groups.map((g) => (
              <option key={g} value={g}>
                {typeLabel[g]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-48 flex-1 gap-1 text-sm font-bold">
          이름
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className="min-h-11 rounded-(--radius-btn) border-[1.5px] border-line bg-surface px-3 text-[15px] font-normal" />
        </label>
        <Button
          onClick={async () => {
            if (await call("POST", "/api/admin/codes", { type: newType, name: newName, sort: 50 })) setNewName("");
          }}
          disabled={loading || !newName.trim()}
          className="!min-h-11"
        >
          추가
        </Button>
      </div>
      {error && <p className="text-sm font-bold text-err">{error}</p>}

      {groups.map((g) => (
        <section key={g} className="grid gap-2">
          <h2 className="text-base font-bold text-muted">{typeLabel[g]}</h2>
          <div className="flex flex-wrap gap-2">
            {codes
              .filter((c) => c.type === g)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => call("PATCH", `/api/admin/codes/${c.id}`, { active: !c.active })}
                  disabled={loading}
                  title={c.active ? "클릭하여 비활성화" : "클릭하여 활성화"}
                  className={`min-h-10 rounded-full border px-4 py-1.5 text-sm transition ${
                    c.active
                      ? "border-primary bg-primary-soft font-bold text-primary-deep"
                      : "border-line bg-surface text-muted line-through"
                  }`}
                >
                  {c.name}
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
