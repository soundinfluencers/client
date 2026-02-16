import { create } from "zustand";

export interface BuildCampaignFiltersState {
  FilterMethod: string;
  setFiltersMethod: (method: string) => void;
  selectedFilter: { key: string; name: string };
  selectedCurrency: { key: string; currency: string };
  selectedBudget: number;
  setFilter: (filter: { key: string; name: string }) => void;
  setCurrency: (currency: { key: string; currency: string }) => void;
  setBudget: (budget: number) => void;
}

const defaultFilter = { key: "bestMatch", name: "Best Match" };
const defaultCurrency = { key: "€", currency: "EUR" };
const defaultBudget = 100000;

export const useBuildCampaignFilters = create<BuildCampaignFiltersState>(
  (set) => ({
    FilterMethod: "and",
    selectedFilter: defaultFilter,
    selectedCurrency: defaultCurrency,
    selectedBudget: defaultBudget,
    setFiltersMethod: (method) => set({ FilterMethod: method }),
    setFilter: (filter) => set({ selectedFilter: filter }),
    setCurrency: (currency) => set({ selectedCurrency: currency }),
    setBudget: (budget) => set({ selectedBudget: budget }),
  }),
);
