# 화면 설계 (design.md)

> v1.0 — 시안 v1 사용자 승인 (2026-09-28). 테마 확정.

## 방향 (확정 2026-09-28)

- 톤: 의료 신뢰형 클린 (화이트 베이스 + 차분한 포인트)
- 브랜드: 새 아이덴티티 (올리브 그린 계승하지 않음)
- 밀도: 접근성 우선 — 큰 글씨, 높은 대비, 단순 동선 (중장년 참여자 고려)
- 구조: 검색·필터 중심의 플랫폼형 재설계

## 테마 프리셋 (v2 — 2026-10-07 그린 전환, 사용자 확정)

- 로고(그린 계열, We Connect Health) 확정에 따라 Primary를 블루→그린으로 전환
- Primary #1F7A3D / Primary-deep #0F4D26 / Accent(CTA 한정) #C9501F 유지
- Ink #1B2A20 / Muted #5A6B5F / BG #F2F6F2 / Surface #FFF / Border #DBE4DC
- 상태색: 성공 #1D8A4E / 경고 #B97D10 / 오류 #C6373C
- (v1 블루 #15579E 계열은 2026-09-28~10-07 사용 후 폐기)
- 서체: Pretendard(자체 호스팅). 본문 17px 이상, 최소 15px
- 굵기(2026-10-07 완화): 제목급 700, 강조 600 — black/bold 토큰 재매핑. 900은 사용하지 않음
- 라운드: 카드 12px, 버튼 10px. 그림자 최소, 보더 위주. 터치 타깃 44px+

## 부품(컴포넌트) 목록 — 개발 시 이 목록만 사용

- Button(primary/accent/outline) · Badge(모집중/검수대기/마감/반려/D-day)
- SearchBar · FilterChip · TrialCard(목록 카드) · SummaryCard(상세 요약)
- FormField(라벨+입력+검증) · AgreeItem(동의 체크) · StepBar · StickyCTA
- StatTile(대시보드 수치) · ListRow(관리 목록 행+액션) · EmptyState/Skeleton/ErrorState

## 기준 패턴 (기준 페이지 3종)

1. 목록: 상단 검색바 + 필터 칩(질환·지역·대상) + 카드 그리드 (PUB-02 기준)
2. 상세: 핵심 요약 카드(대상·기간·기관) 상단 고정 + 본문 + 하단 고정 지원 CTA (PUB-03 기준)
3. 폼: 1열 세로 폼, 단계 표시, 큰 라벨, 인라인 검증 (PUB-04, PTR-05 기준)

## 화면 상태 규칙

- 모든 화면은 빈 / 로딩(스켈레톤) / 오류(재시도) / 성공 4상태를 정의한다

## 원칙

- 시안 도구 산출 코드는 리포지토리에 넣지 않는다. 시안 확정 후 프로젝트 부품으로 재구현한다
- 화면목록표는 docs/screens.md, 도메인 규칙은 docs/domain/*.md 참조
