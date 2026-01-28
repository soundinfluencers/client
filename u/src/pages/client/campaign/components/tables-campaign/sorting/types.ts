export type SortDir = "asc" | "desc" | null;

export type SortKey =
  | "followers"
  | "impressions"
  | "likes"
  | "comments"
  | "saves"
  | "shares";

export type SortState = {
  key: SortKey | null;
  dir: SortDir;
};
