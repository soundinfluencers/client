import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CampaignAddedAccount } from "@/types/store/index.types";
import { ObjectId } from "bson";
import { getGroupBySocial } from "@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced";

export const getStrategyAccountKey = (n: CampaignAddedAccount) =>
  String((n as any).addedAccountsId ?? (n as any).accountId ?? (n as any)._id);
const oid = () => new ObjectId().toHexString();
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
  addContentForSocial: (
    campaignId: string,
    socialMedia: string,
    payload: { mainLink: string },
    inheritFromContentId?: string,
  ) => string;

  removeContentItem: (campaignId: string, contentId: string) => void;
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
    addContentForSocial: (
      campaignId,
      socialMedia,
      payload,
      inheritFromContentId,
    ) => {
      const key = String(campaignId ?? "");
      if (!key) return "";

      const sm = String(socialMedia ?? "").toLowerCase();
      const group = getGroupBySocial(sm);
      const newId = oid();

      set((state) => {
        const prev = state.contentByCampaignId[key] ?? [];

        const base =
          (inheritFromContentId
            ? prev.find((c) => String(c._id) === String(inheritFromContentId))
            : prev.find(
                (c) => String(c.socialMedia ?? "").toLowerCase() === sm,
              )) ?? prev.find((c) => c.socialMediaGroup === group);

        const nextItem: CampaignContentItem = {
          _id: newId,
          socialMedia: sm,
          socialMediaGroup: group,
          mainLink: payload?.mainLink ?? "",

          taggedUser: base?.taggedUser ?? "",
          taggedLink: base?.taggedLink ?? "",
          additionalBrief: base?.additionalBrief ?? "",
          descriptions: (base?.descriptions ?? []).map((d) => ({
            _id: oid(), // ✅ уникальный id для каждой desc
            description: d?.description ?? "",
          })),
        };

        return {
          contentByCampaignId: {
            ...state.contentByCampaignId,
            [key]: [...prev, nextItem],
          },
        };
      });

      return newId;
    },

    removeContentItem: (campaignId, contentId) => {
      const key = String(campaignId ?? "");
      if (!key) return;

      set((state) => {
        const prev = state.contentByCampaignId[key] ?? [];
        const next = prev.filter((c) => String(c._id) !== String(contentId));
        if (next.length === prev.length) return state;

        return {
          contentByCampaignId: {
            ...state.contentByCampaignId,
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
