"use client";

export function FilterChip({
  active = false,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-10 rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? "border-primary bg-primary font-bold text-white"
          : "border-line bg-surface text-ink hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = "질환명, 병원으로 검색",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-(--radius-card) border-[1.5px] border-line bg-surface px-4 py-3 focus-within:border-primary">
      <span aria-hidden>🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-base outline-none placeholder:text-muted"
      />
    </label>
  );
}
