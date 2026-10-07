-- 공고 썸네일 공개 버킷 (게시 공고에 노출되는 공개 콘텐츠).
-- 업로드는 서버 API(service_role)만 수행 — storage.objects 정책 없음.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('thumbs', 'thumbs', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
