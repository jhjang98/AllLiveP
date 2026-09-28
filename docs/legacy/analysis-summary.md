# 기존 시스템(AllLiveC) 분석 요약

> 작성일: 2026-09-28 · 근거: 소스 3종 정적 분석 + schema.sql 대조 (DB 실데이터 미확인)
> 공통: CodeIgniter 3.1.11 / PHP / MySQL(AWS RDS, DB명 `AllLive`, 스테이징 `AllLive_stg`)
> 스키마 파일: `D:\project\AllLiveC\source\aviv_alllivec_admin\doc\sql\schema.sql` (43개 테이블, 컬럼 COMMENT 포함. 단 `indication2_seed`, `indication3_seed`, `project_class` 등 최신 컬럼 일부 누락 — DB 실물과 대조 필요)

## 1. 시스템 구성

| 시스템 | 도메인 | 역할 | 사용자 |
|---|---|---|---|
| 사용자 사이트 (aviv_new_alllivec) | alllivec.co.kr | 공고 열람·검색·지원, 회원가입, 마이페이지 | 일반회원, 비회원 |
| 관리자 (aviv_alllivec_admin) | (내부) | 과제(공고)·대상자·회원·코드·메시지·통계 관리 | 내부 운영자 (admin.type=0) |
| CRM (aviv_alllivec_crm) | alllivecrm.co.kr | 연계된 대상자 열람 (읽기 전용) | 의뢰사(type=1), 실시기관/병원(type=2) |

세 시스템이 **동일 DB를 공유**한다. 계정 테이블도 `admin` 하나를 공유하며 type으로 구분.

## 2. 핵심 데이터 구조

```
project (과제/공고)
 ├─ project_agency_group (과제-기관 연결: type 1=의뢰기관, 2=실시기관(복수))
 │   └─ project_manager_auth (기관 담당자 권한 → admin)
 ├─ project_survey (콜스크립트/설문 문항)
 └─ project_offline_img (오프라인 공고 이미지)

account (일반회원) ─ account_disease (관심질환) ─ account_scrap (스크랩)
prospective_applicant (예비참여희망자 풀, 비회원 가능) ─ prospective_disease

applicant (지원/연계 건: project_seed + account_seed + project_agency_seed)
 └─ applicant_log (상태변경·열람 이력: update_seed, update_reason, approved_yn, 열람자/일시/IP)

category_code (코드 대분류: type 1=임상단계, 2=대상구분, 3=적응증, 4=관심분야, 5=대상자상태, 6~8=유입경로)
 └─ category_code_sub (세부코드; 상태의 경우 sms_show_seed/sms_hide_seed로 자동 SMS 연결)

agency (기관 마스터) · admin (운영자/기관 계정) · sms_send_group (메시지 템플릿)
```

## 3. 공고(project) 주요 필드 (schema.sql 590~644행 확인)

- 식별: pid(P00001), protocol_no, title, sub_title(노출 제목)
- 분류: 적응증 1~3(indication_seed), 임상단계(clinical_step_seed), 대상구분(clinical_target_seed: 124 질환자/125 건강인/126 모두)
- 모집조건: gender(0여/1남/2무관), age_start/age_end(스키마 주석상 "사용안함", 코드에서는 검증에 사용), target_age(표시용), target_number, 모집기간(started_at/end_at), 조기마감, 기간연장(extension_date JSON)
- 상태: status_yn — W 대기 / R 반려 / Y 모집중 / N 마감 / T 가등록 (매시 Cron이 기간 기준 자동 전환)
- 본문: project_detail(HTML, SmartEditor2), 썸네일, 첨부(모집공고문), synopsys
- 신청방식: source_callcenter 0~5 (콜센터/기관콜센터/직접전화/외부수집) + 각 연락처·링크
- 노출: show_status_yn, project_class(메인 노출 등급)
- 컴플라이언스: reading_period(열람가능기간 36/60/120개월), hide_ap_date(열람 숨김 기준일), privacy_yn(민감정보 동의 노출)
- 지역 필드 없음 — 실시기관 주소·좌표(agency.addr, map_x/y)로 표현
- **사례비 필드 없음** — 본문 HTML에 포함되는 것으로 보임

## 4. 지원자(applicant) 상태 모델

- status_seed → category_code_sub(세부) → category_code type 5(대분류)
- 대분류 그룹: **신청(1,2,3,5) → 연계(6) → 연계후 진행(7)/부재(8)/취소(9)**, 연계전 탈락·취소(4)
- approved_yn: ''(불필요) / W(대기) / Y(승인) / N(반려) — 대분류의 admin_check_yn=Y이면 승인 필요
- 병원(CRM) 노출 조건: 대분류 institution_check_yn=Y AND (승인 필요 시 approved_yn=Y)
- 상태 변경 시: applicant_log 이력 + 대상자 자동 SMS(상태 코드에 연결된 템플릿) + 반려 시 담당자 SMS
- 열람 제한: hide_ap_date 이전 지원 건 숨김, end_at + reading_period 경과 시 열람 차단
- 병원의 "확인"은 상태 변경이 아니라 **열람 기록**(열람자·일시·IP → applicant_log)
- 하드코딩 seed: 16(콜센터 미사용 자동연계), 27→42(타 실시기관 이전, 레코드 복제), 7(강제취소), 8(사용자 취소)
- 동의 4종이 applicant에 저장: privacy1(개인정보 수집, 필수), privacy2(제3자 제공, 필수), privacy3(민감정보 수집, 선택), privacy4(민감정보 제3자 제공, 선택)

## 5. 지원 흐름 (사용자 사이트)

1. 로그인 필수 (SNS: 카카오/네이버/구글/애플, 또는 이메일+SHA256)
2. 미인증 계정은 NICE 본인인증 → 이름/휴대폰/성별/생년월일 확정 (동일인 중복계정 차단)
3. 검증: 1일 1회 / 동일 과제 중복 / 마감 / 성별 / 나이
4. 입력: 거주지역(city/sigugun), 실시기관 선택, 동의 4종
5. applicant INSERT (콜센터 미사용 과제는 status 16 자동연계, 그 외 3) → 카카오 알림톡(실패 시 SMS 대체)
6. 비회원 경로는 특정 공고 지원이 아니라 **예비참여희망자 풀 등록**(prospective_applicant)

## 6. 관리자 기능 (9개 메뉴 그룹)

연계현황(지원자 관리·리포트) / 자원자풀(회원·예비·휴면·탈퇴) / 과제 설정 / 코드·배너(기관·적응증·유입경로·상태코드·배너) / 계정(관리자·의뢰기관·실시기관) / 메시지(SMS 이력·템플릿) / 게시판(공지·FAQ·약관 등) / 보안(개인정보 분리·접속기록) / 통계

- 관리자 권한: 메뉴별 JSON(admin_auth) + 세부 플래그(강제취소, 승인처리, 전체과제 조회 등) + 과제별 접근(project_auth)
- Cron: 매시 과제 상태 자동 전환, 주간 의뢰기관 리포트 메일, Meta 광고 리포트 수집
- Meta 리드광고 웹훅으로 대상자 자동 등록 (meta_form_id 매칭)
- 엑셀 다운로드 시 비밀번호 + 사유 기록(excel_log)

## 7. 외부 연동 목록

| 연동 | 용도 | 비고 |
|---|---|---|
| NICE CheckPlus | 본인인증 | 신청 전 필수 |
| 카카오 알림톡 (메일링크) | 신청/취소/상태변경 통지 | 실패 시 SMS 폴백 |
| 가비아 SMS | SMS/LMS 발송, 인증번호 | |
| SNS 로그인 | 카카오/네이버/구글/애플 | |
| 네이버웍스 SMTP | 리포트 메일 | |
| Meta Marketing API + 웹훅 | 광고 리포트, 리드폼 대상자 유입 | |
| 카카오맵/공유, 네이버 전환 스크립트 | 프론트 | |
| 푸시(FCM) | **없음** (빈 파일) | |

## 8. 리뉴얼 시 주의사항

- 비밀번호: 솔트 없는 SHA-256 (+평문 비교 허용) → 이관 불가. 데이터 이관 자체가 불필요로 확정(2026-09-28)되어 이슈 소멸
- SQL 문자열 직접 조립(인젝션 위험) → 신규는 전면 재작성 대상
- 레거시 깨진 코드 다수(Event, Review, Push 등) → 이관 대상 아님
- 개인정보 열람 로그(열람자·일시·IP)와 열람기한 정책은 컴플라이언스 성격 — 신규에도 반드시 승계
- 관리자 IP 제한 코드는 주석 처리되어 미동작 — 신규에서 정상 구현 필요
- 세부 확인용 핵심 파일 (admin: `basic_helper.php`, `sub3/Project.php`, `ajax/Applicant.php`, `Applicant_m.php` / user: `Project_m.php`, `Applicant_m.php`, `Account_m.php` / crm: `Applicant_m.php`)
