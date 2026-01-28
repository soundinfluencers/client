import { create } from "zustand";
import type { ListDisplayMode } from "../../../../types/utils/constants.types";

interface DashboardLayoutState {
  viewMode: ListDisplayMode;
  setViewMode: (mode: ListDisplayMode) => void;

  activePromosFilter: string;
  setActivePromosFilter: (option: string) => void;
  limit: number;

  activeCampaignHistoryFilter: string;
  setActiveCampaignHistoryFilter: (option: string) => void;
}

export const useDashboardLayoutStore = create<DashboardLayoutState>((set) => ({
  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),

  activePromosFilter: "all",
  setActivePromosFilter: (option) => set({ activePromosFilter: option }),
  limit: 12,

  activeCampaignHistoryFilter: "all",
  setActiveCampaignHistoryFilter: (option) =>
    set({ activeCampaignHistoryFilter: option }),
}));