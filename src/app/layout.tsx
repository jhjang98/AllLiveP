import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AllLiveP — 임상시험 모집 플랫폼", template: "%s | AllLiveP" },
  description: "임상시험 대상자 모집 공고 플랫폼",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard — 추후 자체 호스팅으로 전환 (design.md) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen">
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="text-xl font-black text-primary-deep">
              AllLive<span className="text-accent">P</span>
            </Link>
            <nav className="flex items-center gap-5 text-[15px] text-muted">
              <Link href="/trials" className="hover:text-ink">
                공고 찾기
              </Link>
              <span aria-disabled className="cursor-not-allowed opacity-50">
                로그인
              </span>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-line py-8 text-center text-sm text-muted">
          AllLiveP · 임상시험 대상자 모집 플랫폼
        </footer>
      </body>
    </html>
  );
}
