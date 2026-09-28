"use client";

import { useId } from "react";

export function FormField({
  label,
  required = false,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-base font-bold">
        {label}
        {required && (
          <span className="ml-1 text-err" aria-label="필수">
            *
          </span>
        )}
      </span>
      {children}
      {hint && !error && <p className="text-sm text-ok">{hint}</p>}
      {error && (
        <p role="alert" className="text-sm text-err">
          {error}
        </p>
      )}
    </div>
  );
}

export function AgreeItem({
  checked,
  onChange,
  required = false,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 rounded-(--radius-btn) border border-line bg-surface px-3.5 py-3 text-[15px] has-checked:border-primary"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 flex-none accent-primary"
      />
      <span>
        <b>{required ? "[필수]" : "[선택]"}</b> {children}
      </span>
    </label>
  );
}

export function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <i
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < current ? "bg-primary" : "bg-line"}`}
        />
      ))}
    </div>
  );
}

export function StickyCTA({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-6 border-t border-line bg-surface px-4 py-3">
      {children}
    </div>
  );
}
