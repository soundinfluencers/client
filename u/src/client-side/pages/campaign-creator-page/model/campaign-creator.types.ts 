import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export type CampaignCreatorViewMode = "table" | "grid";

export type PromoCardsSearchParams = {
  selected: FilterItem[];
  budget: string;
  currency: string;
  sortBy: string;
  query: string;
  filterMethod: string;
  limit: number;
};

export type PromoCardsSearchResult = {
  q: string;
  isSearchMode: boolean;
  promoCards: IPromoCard[];
  promoLoading: boolean;
  promoFetching: boolean;
  promoError: boolean;
  promoRefetch: () => void;
  searchResults: IPromoCard[];
  searchLoading: boolean;
  searchFetching: boolean;
  searchError: boolean;
  searchRefetch: () => void;
};