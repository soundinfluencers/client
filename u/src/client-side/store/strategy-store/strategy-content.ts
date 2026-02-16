import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CampaignAddedAccount } from "@/types/store/index.types";

export const getStrategyAccountKey = (n: CampaignAddedAccount) =>
  String((n as any).addedAccountsId ?? (n as any).accountId ?? (n as any)._id);

type CampaignContentItem = {
  _id: string;
  socialMedia?: string;
  socialMediaGroup: "main" | "music" | "press";
  descriptions?: Array<{ _id: string; description?: string }>;
  mainLink?: string;
  taggedUser?: string;
  taggedLink?: string;
  additionalBrief?: string;
};

type StrategyCampaignStore = {
  accountsByCampaignId: Record<string, CampaignAddedAccount[]>;
  contentByCampaignId: Record<string, CampaignContentItem[]>;

  initCampaign: (
    campaignId: string,
    serverAccounts: CampaignAddedAccount[],
    serverContent: CampaignContentItem[],
    opts?: { force?: boolean },
  ) => void;

  setAccountDateRequest: (
    campaignId: string,
    accountKey: string,
    dateRequest: string,
  ) => void;

  mergeContent: (
    campaignId: string,
    contentToAdd: CampaignContentItem[],
  ) => void;

  clearCampaign: (campaignId: string) => void;
};

export const useStrategyCampaignStore = create<StrategyCampaignStore>()(
  devtools((set) => ({
    accountsByCampaignId: {},
    contentByCampaignId: {},

    initCampaign: (campaignId, serverAccounts, serverContent, opts) => {
      set((state) => {
        const key = String(campaignId ?? "");
        if (!key) return state;

        const exists =
          state.contentByCampaignId[key] || state.accountsByCampaignId[key];
        if (exists && !opts?.force) return state;

        return {
          accountsByCampaignId: {
            ...state.accountsByCampaignId,
            [key]: serverAccounts ?? [],
          },
          contentByCampaignId: {
            ...state.contentByCampaignId,
            [key]: serverContent ?? [],
          },
        };
      });
    },

    setAccountDateRequest: (campaignId, accountKey, dateRequest) => {
      set((state) => {
        const key = String(campaignId ?? "");
        if (!key) return state;

        const prev = state.accountsByCampaignId[key] ?? [];
        const next = prev.map((a) =>
          getStrategyAccountKey(a) === accountKey ? { ...a, dateRequest } : a,
        );

        if (next === prev) return state;

        return {
          accountsByCampaignId: {
            ...state.accountsByCampaignId,
            [key]: next,
          },
        };
      });
    },

    mergeContent: (campaignId, contentToAdd) => {
      set((state) => {
        const key = String(campaignId ?? "");
        if (!key) return state;

        const prev = state.contentByCampaignId[key] ?? [];
        const incoming = contentToAdd ?? [];

        const map = new Map<string, CampaignContentItem>();
        [...prev, ...incoming].forEach((it) => {
          if (!it) return;
          const k = String(it._id ?? `${it.socialMedia}-${it.mainLink ?? ""}`);
          map.set(k, it);
        });

        return {
          contentByCampaignId: {
            ...state.contentByCampaignId,
            [key]: Array.from(map.values()),
          },
        };
      });
    },

    clearCampaign: (campaignId) => {
      set((state) => {
        const key = String(campaignId ?? "");
        if (!key) return state;

        const nextAcc = { ...state.accountsByCampaignId };
        const nextContent = { ...state.contentByCampaignId };
        delete nextAcc[key];
        delete nextContent[key];

        return {
          accountsByCampaignId: nextAcc,
          contentByCampaignId: nextContent,
        };
      });
    },
  })),
);
