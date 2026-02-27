import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { buildProposalPatchBody } from "@/client-side/utils";

const pickProposalAmount = (a: any) => {
  const v = Number(a?.publicPrice ?? a?.price ?? 0);
  return Number.isFinite(v) ? v : 0;
};

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
  payloadByOptionKey: Record<OptionKey, any>;

  initOption: (
    campaignId: string,
    optionIndex: number,
    serverAccounts: any[],
    serverContent: CampaignContentItem[],
    opts?: { force?: boolean },
  ) => void;

  getOptionPrice: (campaignId: string, optionIndex: number) => number;

  setProposalPayload: (
    campaignId: string,
    optionIndex: number,
    payload: any,
  ) => void;
  getProposalPayload: (campaignId: string, optionIndex: number) => any | null;

  getCampaignPayload: (
    campaignId: string,
    optionIndex: number,
    campaignName: string,
    patches?: Record<string, any>,
  ) => any;

  clearOption: (campaignId: string, optionIndex: number) => void;
};

export const useProposalCampaignStore = create<ProposalCampaignStore>()(
  devtools((set, get) => ({
    accountsByOptionKey: {},
    contentByOptionKey: {},
    payloadByOptionKey: {},

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

    getOptionPrice: (campaignId, optionIndex) => {
      const st = get();
      const key = makeOptionKey(campaignId, optionIndex);
      const accounts = st.accountsByOptionKey[key] ?? [];
      return accounts.reduce((sum, a) => sum + pickProposalAmount(a), 0);
    },

    setProposalPayload: (campaignId, optionIndex, payload) =>
      set((s) => {
        const key = makeOptionKey(campaignId, optionIndex);
        return {
          payloadByOptionKey: { ...s.payloadByOptionKey, [key]: payload },
        };
      }),

    getProposalPayload: (campaignId, optionIndex) => {
      const st = get();
      const key = makeOptionKey(campaignId, optionIndex);
      return st.payloadByOptionKey[key] ?? null;
    },

    getCampaignPayload: (
      campaignId,
      optionIndex,
      campaignName,
      patches = {},
    ) => {
      const st = get();
      const key = makeOptionKey(campaignId, optionIndex);

      const accounts = st.accountsByOptionKey[key] ?? [];
      const content = st.contentByOptionKey[key] ?? [];

      const totalPublicPrice = st.getOptionPrice(campaignId, optionIndex);

      const body = buildProposalPatchBody({
        campaignName,
        accounts,
        content,
        patches,
        totalPublicPrice,
      });

      const socials = Array.from(
        new Set(
          (body.addedAccounts ?? [])
            .map((a: any) => a.socialMedia)
            .filter(Boolean),
        ),
      );
      const socialMedia =
        socials.length > 1 ? "multipromo" : (socials[0] ?? "");

      return {
        ...body,
        socialMedia,
        campaignPrice: Number(totalPublicPrice ?? 0),
      };
    },

    clearOption: (campaignId, optionIndex) => {
      set((state) => {
        const key = makeOptionKey(campaignId, optionIndex);

        const nextAcc = { ...state.accountsByOptionKey };
        const nextContent = { ...state.contentByOptionKey };
        const nextPayload = { ...state.payloadByOptionKey };

        delete nextAcc[key];
        delete nextContent[key];
        delete nextPayload[key];

        return {
          accountsByOptionKey: nextAcc,
          contentByOptionKey: nextContent,
          payloadByOptionKey: nextPayload,
        };
      });
    },
  })),
);
