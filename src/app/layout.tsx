import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
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
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-line py-8 text-center text-sm text-muted">
          AllLiveP · 임상시험 대상자 모집 플랫폼
        </footer>
      </body>
    </html>
  );
}
