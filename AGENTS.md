# AllLiveP — AI 작업 규칙 (착수 자산)

임상시험 대상자 모집 공고 플랫폼. Next.js(App Router, TS) + Supabase + Vercel.

## 반드시 먼저 읽을 문서

| 무엇을 할 때 | 읽을 문서 |
|---|---|
| 어떤 작업이든 | `docs/requirements.md` (EARS 요구사항, 확정 이력) |
| 업무규칙·상태전이 | `docs/domain/{announcement,application,institution,member}.md` |
| 화면 작업 | `docs/design.md`(토큰·부품), `docs/screens.md`(화면목록) |
| API·DB 작업 | `docs/architecture.md`, `openapi.json`, `supabase/migrations/`, `docs/permissions.md` |
| 아키텍처 판단 | `docs/adr/*.md` |

## 참조 구현 (새 코드는 이것을 복제한다)

- 목록 화면: `src/app/trials/page.tsx`
- 상세 화면: `src/app/trials/[id]/page.tsx`
- 폼 화면: `src/app/trials/[id]/apply/page.tsx`
- UI 부품: `src/components/ui/` — **새 부품을 만들기 전에 여기 있는 것을 재사용**

## 규칙

1. 색·크기 하드코딩 금지 — `globals.css`의 토큰(@theme)만 사용. 새 색이 필요하면 design.md 개정 먼저
2. 업무규칙이 있는 쓰기·개인정보 접근은 Route Handler(`/api/*`)에서만. 클라이언트 직접 쓰기는 스크랩·프로필 수준만 (ADR-0002)
3. 지원자 개인정보 열람은 반드시 열람 로그(`application_events.pii_view`)를 남기는 API 경유
4. 스키마 변경은 `supabase/migrations/` 새 파일로만. 기존 마이그레이션 수정 금지
5. 권한 변경은 `docs/permissions.md` 개정(사람 승인) 없이 하지 않는다
6. 한 PR = 화면(기능) 1개. 파일 10개·500줄 내외
7. 완료 주장은 검증 로그(빌드·테스트 출력) 첨부로만
8. 상태값은 enum 그대로 사용 — 새 상태 추가는 도메인 문서 개정 + 마이그레이션
9. 개인정보(이름·전화)는 로그·에러에 마스킹: 김○○, 010-****-5678
10. 문서와 코드가 다르면 작업을 멈추고 사람에게 확인

## 명령

- `npm run dev` 개발 서버 · `npm run build` 빌드 · `npm run typecheck` 타입 검사

## 레거시 참고

기존 시스템(PHP) 분석: `docs/legacy/analysis-summary.md`. 소스: `D:\project\AllLiveC\source\` (읽기 전용 참고, 코드 이식 금지)
