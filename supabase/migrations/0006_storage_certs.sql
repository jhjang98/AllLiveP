-- 기관 증빙(사업자등록증) 비공개 버킷. 업로드·조회는 서버 API(service_role)만 수행한다.
-- (storage.objects에 정책을 추가하지 않으므로 클라이언트 직접 접근은 불가)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certs', 'certs', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;
