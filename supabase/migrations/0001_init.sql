-- AllLiveP 초기 스키마 (초안 v0.1, 2026-09-28) — 설계 검토·승인 전. 승인 후에만 적용한다.
-- 원칙: 모든 개인정보 접근은 RLS + 서버 API 경유. 열람·상태변경은 application_events에 기록.

-- ── 공통 enum ──────────────────────────────────────────────
create type user_role as enum ('member','institution','admin');
create type gender_type as enum ('female','male','any');
create type person_gender as enum ('female','male');
create type target_type as enum ('patient','healthy','all');
create type institution_status as enum ('pending','approved','rejected','suspended');
create type announcement_status as enum ('draft','pending_review','rejected','approved','closed');
create type application_status as enum ('applied','viewed','in_progress','selected','not_selected','canceled');
create type app_event_type as enum ('status_change','pii_view','submit','note');
create type code_type as enum ('indication','clinical_step','interest','not_selected_reason');

-- ── 회원 (auth.users 1:1) ─────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'member',
  name text,
  phone text unique,                       -- 본인확인 완료 시에만 채움 (E.164)
  phone_verified_at timestamptz,
  gender person_gender,
  birth_date date,
  city text, district text,
  person_type target_type,                 -- 건강인/질환자 (매칭정보, 선택)
  matching_agreed_at timestamptz,
  marketing_agreed_at timestamptz,
  created_at timestamptz not null default now(),
  withdrawn_at timestamptz                 -- 탈퇴 시각. 개인정보 컬럼은 비식별화 처리
);
comment on table profiles is '회원 프로필. role=member 일반회원 / institution 기관 담당자 / admin 운영자';

create table member_diseases (
  profile_id uuid not null references profiles(id) on delete cascade,
  code_id int not null,                    -- codes(indication)
  primary key (profile_id, code_id)
);

create table phone_verifications (
  id bigint generated always as identity primary key,
  phone text not null,
  code_hash text not null,
  purpose text not null default 'verify',  -- verify | prospective
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── 코드 ──────────────────────────────────────────────────
create table codes (
  id int generated always as identity primary key,
  type code_type not null,
  parent_id int references codes(id),      -- indication → interest(관심분야) 매핑
  name text not null,
  sort int not null default 0,
  active boolean not null default true
);

-- ── 기관 ──────────────────────────────────────────────────
create table institutions (
  id bigint generated always as identity primary key,
  name text not null,
  biz_reg_no text not null unique,         -- 사업자등록번호 (하이픈 제거 저장)
  biz_cert_path text not null,             -- Storage: 사업자등록증
  phone text, address text, address_detail text,
  lat double precision, lng double precision,
  logo_path text, intro text,
  status institution_status not null default 'pending',
  status_reason text,                      -- 반려·정지 사유
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table institution_members (
  institution_id bigint not null references institutions(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  member_role text not null default 'owner',   -- 1차: owner만 사용
  primary key (institution_id, profile_id)
);

-- ── 공고 ──────────────────────────────────────────────────
create table announcements (
  id bigint generated always as identity primary key,
  institution_id bigint not null references institutions(id),
  title text not null,
  protocol_no text,
  sponsor_name text,                       -- 의뢰기관 표기 (텍스트, 확정 기본값)
  clinical_step_id int references codes(id),
  target target_type not null default 'all',
  gender gender_type not null default 'any',
  age_min int not null default 19,
  age_max int not null default 99,
  target_count int,
  recruit_start date not null,
  recruit_end date not null,
  participation_text text,                 -- 참여기간 안내 예: "외래 4회"
  body text not null,                      -- 리치텍스트(HTML, sanitize 필수)
  thumbnail_path text, attachment_path text,
  reading_period_months int not null default 36,
  sensitive_consent_required boolean not null default false,  -- 지원 시 민감정보 동의 노출
  status announcement_status not null default 'draft',
  reject_reason text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  early_closed_at timestamptz,
  hidden boolean not null default false,   -- 관리자 강제 비노출
  view_count int not null default 0,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint age_range check (age_min <= age_max),
  constraint recruit_range check (recruit_start <= recruit_end)
);
comment on column announcements.status is 'draft→pending_review→(approved|rejected)→closed. 게시=approved+기간내+not hidden';

create table announcement_indications (
  announcement_id bigint not null references announcements(id) on delete cascade,
  code_id int not null references codes(id),
  primary key (announcement_id, code_id)   -- 최대 3개는 서버에서 검증
);

create table scraps (
  profile_id uuid not null references profiles(id) on delete cascade,
  announcement_id bigint not null references announcements(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, announcement_id)
);

-- ── 지원 ──────────────────────────────────────────────────
create table applications (
  id bigint generated always as identity primary key,
  announcement_id bigint not null references announcements(id),
  member_id uuid not null references profiles(id),
  status application_status not null default 'applied',
  not_selected_reason_id int references codes(id),
  city text not null, district text not null,
  consent_privacy boolean not null,        -- 필수
  consent_third_party boolean not null,    -- 필수
  consent_sensitive boolean not null default false,
  consent_sensitive_third boolean not null default false,
  applied_at timestamptz not null default now(),
  canceled_at timestamptz,
  unique (announcement_id, member_id)      -- 중복 지원 차단 (취소 후 재지원 불가 정책 포함)
);

create table application_events (
  id bigint generated always as identity primary key,
  application_id bigint not null references applications(id) on delete cascade,
  actor_id uuid references profiles(id),
  actor_role user_role,
  event app_event_type not null,
  from_status application_status,
  to_status application_status,
  reason text,
  ip inet,
  created_at timestamptz not null default now()
);
comment on table application_events is '상태 이력 + 개인정보 열람 로그(pii_view). 컴플라이언스 — 삭제 금지';
create index on application_events (application_id, created_at);

-- ── 예비참여희망자 ─────────────────────────────────────────
create table prospective_registrations (
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null unique,              -- 휴대폰 1개당 1건 (레거시 정책 승계)
  gender person_gender,
  birth_date date,
  city text, district text,
  person_type target_type,
  canceled_at timestamptz,
  created_at timestamptz not null default now()
);

create table prospective_diseases (
  registration_id bigint not null references prospective_registrations(id) on delete cascade,
  code_id int references codes(id),
  custom_title text,                       -- 기타 질환 자유입력
  primary key (registration_id, code_id)
);

-- ── 콘텐츠·알림 ────────────────────────────────────────────
create table notices (
  id bigint generated always as identity primary key,
  title text not null, body text not null,
  published boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table faqs (
  id bigint generated always as identity primary key,
  category text, question text not null, answer text not null,
  sort int not null default 0, published boolean not null default true
);

create table notifications (
  id bigint generated always as identity primary key,
  recipient_email text not null,
  template text not null,                  -- application_received, review_result, ...
  payload jsonb not null default '{}',
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

-- ── RLS (초안 — 권한표 docs/permissions.md 확정 후 세부 검토) ──
alter table profiles enable row level security;
alter table member_diseases enable row level security;
alter table scraps enable row level security;
alter table institutions enable row level security;
alter table institution_members enable row level security;
alter table announcements enable row level security;
alter table announcement_indications enable row level security;
alter table applications enable row level security;
alter table application_events enable row level security;
alter table prospective_registrations enable row level security;
alter table prospective_diseases enable row level security;
alter table phone_verifications enable row level security;  -- 서버 전용 (정책 없음)
alter table notifications enable row level security;         -- 서버 전용
alter table codes enable row level security;
alter table notices enable row level security;
alter table faqs enable row level security;

-- 공개 읽기
create policy codes_read on codes for select using (active);
create policy notices_read on notices for select using (published);
create policy faqs_read on faqs for select using (published);
create policy ann_public_read on announcements for select
  using (status in ('approved','closed') and not hidden);
create policy ann_ind_read on announcement_indications for select using (true);

-- 본인
create policy profile_self on profiles for select using (id = auth.uid());
create policy profile_self_up on profiles for update using (id = auth.uid());
create policy diseases_self on member_diseases for all using (profile_id = auth.uid());
create policy scraps_self on scraps for all using (profile_id = auth.uid());
create policy app_self_read on applications for select using (member_id = auth.uid());

-- 기관 담당자: 자기 기관 것만 (쓰기는 서버 API 경유가 원칙, 읽기만 허용)
create policy inst_self_read on institutions for select
  using (id in (select institution_id from institution_members where profile_id = auth.uid()));
create policy inst_mem_self on institution_members for select using (profile_id = auth.uid());
create policy ann_own_read on announcements for select
  using (institution_id in (select institution_id from institution_members where profile_id = auth.uid()));
create policy app_inst_read on applications for select
  using (announcement_id in (
    select a.id from announcements a
    join institution_members im on im.institution_id = a.institution_id
    where im.profile_id = auth.uid()));
-- 주의: 지원자 개인정보(profiles) 열람은 RLS로 열지 않는다.
-- 반드시 서버 API(service-role)가 열람기한 검사 + pii_view 기록 후 반환한다.

-- 관리자: role=admin 은 서버 API(service-role) 경유 — 클라이언트 직접 접근 정책 없음
