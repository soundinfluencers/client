import { create } from "zustand";
import type { BuildCampaignFiltersState } from "./types";
import {
    DEFAULT_BUDGET,
    DEFAULT_CURRENCY,
    DEFAULT_FILTER,
    DEFAULT_FILTER_METHOD,
} from "./constants";

export const useBuildCampaignFilters = create<BuildCampaignFiltersState>(
    (set) => ({
        filterMethod: DEFAULT_FILTER_METHOD,
        selectedFilter: DEFAULT_FILTER,
        selectedCurrency: DEFAULT_CURRENCY,
        selectedBudget: DEFAULT_BUDGET,
        setFilterMethod: (method) => set({ filterMethod: method }),
        setFilter: (filter) => set({ selectedFilter: filter }),
        setCurrency: (currency) => set({ selectedCurrency: currency }),
        setBudget: (budget) => set({ selectedBudget: budget }),
    }),
);