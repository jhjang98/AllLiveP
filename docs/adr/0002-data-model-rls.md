# ADR-0002: 데이터 모델·권한 경계

- 상태: 승인 (2026-09-28, 설계 검토 시 이견 없음)
- 결정자: 사용자 / 작성: Claude

## 결정

1. **레거시 스키마를 이관하지 않고 재설계**한다 (`supabase/migrations/0001_init.sql`). 레거시의 코드표 기반 상태(category_code)는 Postgres enum으로 단순화한다.
2. 계정은 **Supabase auth.users + profiles(role: member/institution/admin) 단일 체계**. 레거시처럼 account/admin 테이블을 분리하지 않는다.
3. 지원자 상태는 6종(applied/viewed/in_progress/selected/not_selected/canceled)으로 축소. 레거시의 연계·콜센터 단계는 승계하지 않는다 (도메인 문서 참조).
4. **application_events를 append-only 감사 테이블**로 두고 상태 이력과 개인정보 열람(pii_view)을 모두 기록한다. 수정·삭제 정책을 만들지 않는다.
5. 지원자 개인정보는 RLS로 기관에 직접 열지 않는다 — 서버 API가 열람기한 검사 후 반환하며 로그를 남긴다. RLS는 비식별 목록까지만 허용.
6. 공고-기관은 1:1(institution_id FK). 레거시의 다대다(project_agency_group)는 승계하지 않는다 — 신규 모델에서 공고 주체는 등록한 기관 하나.

## 근거

- 이관 없음이 확정되어 레거시 호환 부담이 없다 — 단순한 모델을 선택할 수 있는 기회
- enum 상태는 타입 안전·마이그레이션 추적 가능. 운영 중 상태 추가는 마이그레이션 1건으로 처리
- 열람 로그 강제는 레거시에서 검증된 컴플라이언스 요구 (REQ-061/062)

## 트레이드오프

- enum은 운영자가 화면에서 상태를 추가할 수 없다 → 상태 추가는 개발 배포 필요 (의도된 제약)
- 공고 1:1 기관 모델은 다기관 공동 시험을 표현하지 못한다 → 필요해지면 참여기관 테이블 추가 (추가 방향 변경이므로 안전)
