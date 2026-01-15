import { create } from "zustand";

export interface BuildCampaignFiltersState {
  selectedFilter: { key: string; name: string };
  selectedCurrency: { key: string; currency: string };
  selectedBudget: number;
  setFilter: (filter: { key: string; name: string }) => void;
  setCurrency: (currency: { key: string; currency: string }) => void;
  setBudget: (budget: number) => void;
}

// Начальные значения
const defaultFilter = { key: "bestMatch", name: "Best Match" };
const defaultCurrency = { key: "€", currency: "EUR" };
const defaultBudget = 100000;

export const useBuildCampaignFilters = create<BuildCampaignFiltersState>(
  (set) => ({
    selectedFilter: defaultFilter,
    selectedCurrency: defaultCurrency,
    selectedBudget: defaultBudget,

    setFilter: (filter) => set({ selectedFilter: filter }),
    setCurrency: (currency) => set({ selectedCurrency: currency }),
    setBudget: (budget) => set({ selectedBudget: budget }),
  })
);
