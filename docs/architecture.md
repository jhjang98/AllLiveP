# 기술 설계 (architecture)

> v0.1 초안 2026-09-28 — 설계 검토 전

## 스택

- **프론트+서버**: Next.js (App Router, TypeScript) 단일 앱 → Vercel 배포
  - 3영역 라우트 그룹: `(public)` 공개, `partner/` 기관회원, `admin/` 관리자
- **백엔드**: Supabase — Postgres(+RLS), Auth, Storage(증빙·썸네일·첨부)
- **데이터 접근 원칙**
  - 읽기: Supabase 클라이언트 + RLS (공개 목록은 익명 읽기 허용 뷰)
  - **업무규칙이 있는 쓰기는 전부 Next.js Route Handler(`/api/*`)** 에서 service-role로 검증 후 수행 (지원, 검수, 승인 등). 클라이언트 직접 쓰기는 스크랩·프로필 등 단순 건만
- **인증**: Supabase Auth. 이메일+비밀번호, OAuth(카카오·구글). 본인확인은 자체 SMS 인증(`phone_verifications`) — **SMS 발송은 기존 가비아 계약 재사용 (확정 2026-09-28)**, 레거시 `third_party/SMS` XML-RPC 방식을 TypeScript로 재구현
- **알림**: 이메일. 발송사는 기존 네이버웍스 SMTP 재사용을 기본값으로 하고(nodemailer), 전송률 문제 시 Resend 전환 — [기본값 채택, 이견 시 변경]. 발송 기록 `notifications`
- **스케줄**: Vercel Cron — 일 1회 공고 자동 마감(recruit_end 경과 → closed)

## 모듈 경계

| 모듈 | 책임 | 소유 테이블 |
|---|---|---|
| member | 프로필·본인확인·스크랩·예비등록 | profiles, member_diseases, scraps, phone_verifications, prospective_* |
| institution | 기관 가입·승인·담당자 | institutions, institution_members |
| announcement | 공고 작성·검수·게시·마감 | announcements, announcement_indications |
| application | 지원·상태·열람로그 | applications, application_events |
| shared | 코드·콘텐츠·알림 | codes, notices, faqs, notifications |

- 모듈 간 참조는 FK와 서버 코드에서만. 프론트는 화면 단위로 모듈 API 호출

## 컴플라이언스 설계 (레거시 승계)

- 지원자 개인정보 열람 = 반드시 `GET /api/partner/applications/{id}` 경유 → `application_events`에 pii_view(열람자·IP·일시) 기록
- 열람기한: `recruit_end + reading_period_months` 경과 시 위 API가 403
- 로그·에러 리포트에 개인정보 마스킹 (이름 김○○, 전화 뒤 4자리)

## 조건부 인프라 (지금은 도입하지 않음)

- Redis/큐/검색엔진 없음. 검색은 Postgres(ILIKE+GIN)로 시작 — 공고 수천 건 수준까지 충분. 전환 조건은 ADR-0001에 기록
