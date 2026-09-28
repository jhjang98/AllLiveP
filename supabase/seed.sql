-- 초기 코드 데이터 (stg/prod 공통). 적응증은 관심분야(interest) 상위로 시작하고 운영 중 세분화한다.

insert into codes (type, name, sort) values
  ('interest', '내분비 (당뇨 등)', 1),
  ('interest', '순환기 (고혈압 등)', 2),
  ('interest', '소화기', 3),
  ('interest', '호흡기', 4),
  ('interest', '피부', 5),
  ('interest', '신경계·정신건강', 6),
  ('interest', '근골격', 7),
  ('interest', '종양', 8),
  ('interest', '비뇨기·신장', 9),
  ('interest', '안과·이비인후', 10),
  ('interest', '여성건강', 11),
  ('interest', '건강인', 12),
  ('interest', '기타', 99);

insert into codes (type, name, sort) values
  ('clinical_step', '1상', 1),
  ('clinical_step', '2상', 2),
  ('clinical_step', '3상', 3),
  ('clinical_step', '4상', 4),
  ('clinical_step', '생물학적 동등성(BE)', 5),
  ('clinical_step', '관찰연구·기타', 6);

insert into codes (type, name, sort) values
  ('not_selected_reason', '선정 기준 미충족', 1),
  ('not_selected_reason', '모집 인원 마감', 2),
  ('not_selected_reason', '연락 불가', 3),
  ('not_selected_reason', '기타', 9);
