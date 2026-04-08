import type { CampaignContentItem } from "@/client-side/types/content";
import type { ConnectedAccount } from "@/client-side/types/offers";

export type DropdownKey = "date" | "content" | "description";
export type TableGroup = "main" | "music" | "press";
export type DropKey = DropdownKey;

export type DropdownState = Record<string, boolean>;

export type TableStrategyProps = {
    changeView: boolean;
    items: CampaignContentItem[];
    networks: ConnectedAccount[];
    group: TableGroup;
    title: string;
    totalPrice: number;
};

export type ActiveDropdown =
    | {
    indexCard: number;
    key: DropKey;
}
    | null;