import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export type DropdownKey = "date" | "content" | "postDescription";

export type DropdownState = Record<
  number,
  { date: boolean; content: boolean; postDescription: boolean }
>;

export type SortDir = "asc" | "desc" | null;

export type TableGroup = "main" | "music" | "press";

export type TableRowProps = {
  data: IPromoCard;
  indexCard: number;
  changeView: boolean;
  isMusic?: boolean;
  items: any[];
  columns: string[];

  dropdownsOpen: DropdownState;
  setDropdownsOpen: React.Dispatch<React.SetStateAction<DropdownState>>;
};
