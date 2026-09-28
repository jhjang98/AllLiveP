-- 리뷰 반영: 익명/일반 사용자에게는 기관의 "표시용 컬럼"만 허용한다 (데이터 최소화).
-- biz_reg_no, biz_cert_path, phone, status_reason 등은 서버 API(service_role) 경유로만 접근.
-- (RLS의 행 필터 위에 컬럼 권한이 겹쳐 적용된다)

revoke select on table institutions from anon, authenticated;
grant select (id, name, address, address_detail, lat, lng, logo_path, intro, status, created_at)
  on institutions to anon, authenticated;
