-- 게시 공고에 기관 표시정보(이름·주소·로고)가 필요하므로,
-- 승인된 기관은 누구나 읽을 수 있게 한다 (permissions.md: 게시 공고 열람 전체 허용의 일부).
-- biz_cert_path는 비공개 Storage 경로라 노출되어도 접근 불가.

create policy inst_public_read on institutions for select
  using (status = 'approved');
