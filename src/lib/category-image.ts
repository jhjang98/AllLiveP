// 분야(적응증)별 배너 일러스트 매핑 (클라이언트/서버 겸용)
// 우선순위: 기관 업로드 썸네일 → 분야 일러스트 → 코드 그래픽(CategoryVisual)
// 생성 이력·미생성 분야 목록: assets/brand/category-images.md

const CATEGORY_IMAGES: Record<string, string> = {
  "내분비 (당뇨 등)": "/category/endocrine.jpg",
  "순환기 (고혈압 등)": "/category/cardio.jpg",
  "소화기": "/category/digestive.jpg",
  "호흡기": "/category/respiratory.jpg",
  "피부": "/category/skin.jpg",
  "신경계·정신건강": "/category/neuro.jpg",
  "건강인": "/category/healthy.jpg",
  // 미생성(추후): 근골격, 종양, 비뇨기·신장, 안과·이비인후, 여성건강, 기타
};

// 공고의 적응증 목록에서 일러스트가 있는 첫 분야의 이미지를 반환
export function categoryImage(indications: string[]): string | null {
  for (const name of indications) {
    const img = CATEGORY_IMAGES[name];
    if (img) return img;
  }
  return null;
}
