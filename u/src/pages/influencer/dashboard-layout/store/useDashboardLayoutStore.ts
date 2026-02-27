import { create } from "zustand";
import type { ListDisplayMode } from "@/types/utils/constants.types.ts";
import type { TFilterStatus } from "@/pages/influencer/promos/types/promos.types.ts";

interface DashboardLayoutState {
  viewMode: ListDisplayMode;
  setViewMode: (mode: ListDisplayMode) => void;

  activePromosFilter: TFilterStatus;
  setActivePromosFilter: (option: TFilterStatus) => void;
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
