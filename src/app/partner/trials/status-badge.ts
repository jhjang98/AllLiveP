export const statusBadge: Record<
  string,
  { text: string; tone: "open" | "review" | "rejected" | "closed" }
> = {
  draft: { text: "작성 중", tone: "closed" },
  pending_review: { text: "검수 대기", tone: "review" },
  rejected: { text: "반려됨", tone: "rejected" },
  approved: { text: "게시 중", tone: "open" },
  closed: { text: "마감", tone: "closed" },
};
