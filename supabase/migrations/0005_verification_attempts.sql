-- 리뷰 반영: 인증번호 무차별 대입 방지 — 검증 시도 횟수 기록 (5회 초과 시 무효)

alter table phone_verifications add column attempts int not null default 0;
