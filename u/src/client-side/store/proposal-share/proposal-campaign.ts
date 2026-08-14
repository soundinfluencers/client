import { create } from "zustand";
import { devtools } from "zustand/middleware";

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

type OptionKey = string;

const makeOptionKey = (campaignId: string, optionIndex: number): OptionKey =>
  `${String(campaignId ?? "")}:${Number(optionIndex ?? 0)}`;

type ProposalCampaignStore = {
  accountsByOptionKey: Record<OptionKey, any[]>;
  contentByOptionKey: Record<OptionKey, CampaignContentItem[]>;

  initOption: (
    campaignId: string,
    optionIndex: number,
    serverAccounts: any[],
    serverContent: CampaignContentItem[],
    opts?: { force?: boolean },
  ) => void;

  clearOption: (campaignId: string, optionIndex: number) => void;
};

export const useProposalCampaignStore = create<ProposalCampaignStore>()(
  devtools((set) => ({
    accountsByOptionKey: {},
    contentByOptionKey: {},

    initOption: (
      campaignId,
      optionIndex,
      serverAccounts,
      serverContent,
      opts,
    ) => {
      set((state) => {
        const key = makeOptionKey(campaignId, optionIndex);
        if (!key) return state;

        const exists =
          state.accountsByOptionKey[key] || state.contentByOptionKey[key];
        if (exists && !opts?.force) return state;

        return {
          accountsByOptionKey: {
            ...state.accountsByOptionKey,
            [key]: serverAccounts ?? [],
          },
          contentByOptionKey: {
            ...state.contentByOptionKey,
            [key]: serverContent ?? [],
          },
        };
      });
    },

    clearOption: (campaignId, optionIndex) => {
      set((state) => {
        const key = makeOptionKey(campaignId, optionIndex);

        const nextAcc = { ...state.accountsByOptionKey };
        const nextContent = { ...state.contentByOptionKey };

        delete nextAcc[key];
        delete nextContent[key];

        return {
          accountsByOptionKey: nextAcc,
          contentByOptionKey: nextContent,
        };
      });
    },
  })),
);
