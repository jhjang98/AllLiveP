import type { NextConfig } from "next";

// 이미지 원격 호스트는 우리 Supabase 프로젝트로만 고정 (open-proxy 방지 — 리뷰 반영)
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "golzvkmcdbmyfevdhwyw.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
