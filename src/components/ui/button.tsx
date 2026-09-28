import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "outline";

const styles: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-deep",
  accent: "bg-accent text-white hover:brightness-95",
  outline: "border-[1.5px] border-primary bg-surface text-primary hover:bg-primary-soft",
};

export function Button({
  variant = "primary",
  full = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-(--radius-btn) px-6 py-3 text-[17px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}
