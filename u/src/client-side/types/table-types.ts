import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export type DropdownKey = "date" | "content" | "postDescription";

export type DropdownState = Record<
  number,
  { date: boolean; content: boolean; postDescription: boolean }
>;

export type SortDir = "asc" | "desc" | null;

export type TableGroup = "main" | "music" | "press";
type ActiveDropdown = {
  rowKey: string;
  key: "date" | "content" | "postDescription";
} | null;

export type TableRowProps = {
  campaignId?: string;
  rowKey: string;
  data: any;
  items: any[];
  changeView?: boolean;
  group: TableGroup;
  canEdit: boolean;
  activeDropdown: ActiveDropdown;
  onToggleDropdown: (
    rowKey: string,
    key: "date" | "content" | "postDescription",
  ) => void;
  onCloseDropdown: () => void;
  optionIndex?: number;
};

type ActiveDropdownProposal = {
  rowKey: string;
  key: "date" | "content" | "postDescription";
} | null;

export type TableRowProposalProps = {
  rowKey: string;
  data: any;
  items: any[];
  changeView?: boolean;
  group: TableGroup;
  canEdit: boolean;
  activeDropdown: ActiveDropdownProposal;
  onToggleDropdown: (
    rowKey: string,
    key: "date" | "content" | "postDescription",
  ) => void;
  onCloseDropdown: () => void;
  optionIndex?: number;
};
export type DropKey = "date" | "content" | "postDescription";
