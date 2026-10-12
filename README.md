# AllLiveP

임상시험 대상자 모집 공고 플랫폼. Next.js 15 (App Router) + Supabase + Vercel.

## 개발 환경

- Node 20+ / npm
- `npm install` → `.env.example`을 `.env.local`로 복사해 값 입력 → `npm run dev` (http://localhost:3000)
- 검사: `npm run typecheck` · 빌드: `npm run build`
- DB 마이그레이션: `npx supabase db push --db-url "$SUPABASE_DB_URL"` (`supabase/migrations/`)
- 개발 픽스처(테스트 계정·공고): `node --env-file=.env.local scripts/seed-dev.mjs` — 운영에는 사용 금지

## 배포 (Vercel) 환경변수

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 키 (노출 금지) |
| `SMS_MODE` | `mock`(개발) / `live`(가비아 연동 후) |
| `EMAIL_MODE` | `mock` / `live`(SMTP 연동 후) |
| `ADMIN_EMAIL` | 기관 가입·공고 제출 알림 수신 메일 |
| `CRON_SECRET` | 자동 마감 크론 보호 키 (무작위 32자 이상). Vercel Cron이 자동으로 Authorization 헤더에 사용 |

배포 후 Supabase 대시보드 → Authentication → URL Configuration의 Site URL·Redirect URLs에 배포 도메인 추가.

## 문서

요구사항·도메인 규칙·화면·권한·ADR: `docs/` · AI 작업 규칙: `AGENTS.md`
