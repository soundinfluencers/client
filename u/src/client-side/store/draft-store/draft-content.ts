import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CampaignAddedAccount } from "@/types/store/index.types";
import { ObjectId } from "bson";
import { getGroupBySocial } from "@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced";
import { buildProposalPatchBody, pickPrice } from "@/client-side/utils";

export const getDraftAccountKey = (n: CampaignAddedAccount) =>
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

type DraftCampaignStore = {
  accountsByCampaignId: Record<string, CampaignAddedAccount[]>;
  contentByCampaignId: Record<string, CampaignContentItem[]>;
  getCampaignPrice: (campaignId: string) => number;
  getCampaignPriceBreakdown: (campaignId: string) => {
    amount: number;
    currency: "EUR" | "USD" | "GBP" | "UNKNOWN";
  };
  payloadByDraftId: Record<string, any>;
  setDraftPayload: (draftId: string, payload: any) => void;
  getDraftPayload: (draftId: string) => any | null;

  getCampaignPayload: (
    campaignId: string,
    campaignName: string,
    paymentMethod: string,
    patches?: Record<string, any>,
  ) => any;
  // getCampaignPayload: (
  //   campaignId: string,
  //   campaignName: string,
  //   paymentMethod: string,
  // ) => any;
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

export const useDraftCampaignStore = create<DraftCampaignStore>()(
  devtools((set, get) => ({
    accountsByCampaignId: {},
    contentByCampaignId: {},
    payloadByDraftId: {},

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
    getCampaignPrice: (campaignId) => {
      const state = get();
      const accounts = state.accountsByCampaignId[campaignId] ?? [];
      return accounts.reduce(
        (sum, acc: any) => sum + pickPrice(acc.prices).amount,
        0,
      );
    },
    setDraftPayload: (draftId, payload) =>
      set((s) => ({
        payloadByDraftId: { ...s.payloadByDraftId, [draftId]: payload },
      })),

    getDraftPayload: (draftId) => {
      const st = get();
      return st.payloadByDraftId[String(draftId ?? "")] ?? null;
    },

    getCampaignPriceBreakdown: (campaignId) => {
      const state = get();
      const accounts = state.accountsByCampaignId[campaignId] ?? [];

      // если хочешь "валюта кампании" как приоритетная:
      // EUR если хоть у кого-то есть, иначе USD, иначе GBP, иначе UNKNOWN
      const hasEUR = accounts.some((a: any) => Number(a?.prices?.EUR ?? 0) > 0);
      const hasUSD = accounts.some((a: any) => Number(a?.prices?.USD ?? 0) > 0);
      const hasGBP = accounts.some((a: any) => Number(a?.prices?.GBP ?? 0) > 0);

      const currency = hasEUR
        ? "EUR"
        : hasUSD
          ? "USD"
          : hasGBP
            ? "GBP"
            : "UNKNOWN";

      const amount = accounts.reduce(
        (sum, acc: any) => sum + pickPrice(acc.prices).amount,
        0,
      );

      return { amount, currency };
    },
    getCampaignPayload: (
      campaignId,
      campaignName,
      paymentMethod,
      patches = {},
    ) => {
      const st = get();
      const id = String(campaignId ?? "");

      const accounts = st.accountsByCampaignId[id] ?? [];
      const content = st.contentByCampaignId[id] ?? [];

      const body = buildProposalPatchBody({
        campaignName,
        accounts,
        content,
        patches,
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

      const campaignPrice = st.getCampaignPrice(id);

      return {
        ...body, // campaignName, addedAccounts, campaignContent
        socialMedia,
        campaignPrice,
        paymentType: paymentMethod,
      };
    },
    // getCampaignPayload: (campaignId, campaignName, paymentMethod) => {
    //   const state = get();

    //   const accounts = state.accountsByCampaignId[campaignId] ?? [];
    //   const content = state.contentByCampaignId[campaignId] ?? [];

    //   const socials = Array.from(
    //     new Set(
    //       accounts
    //         .map((a) => String(a.socialMedia ?? "").toLowerCase())
    //         .filter(Boolean),
    //     ),
    //   );

    //   const socialMedia =
    //     socials.length > 1 ? "multipromo" : (socials[0] ?? "");

    //   const campaignPrice = get().getCampaignPrice(campaignId);

    //   const addedAccounts = accounts.map((a: any) => ({
    //     socialAccountId: a.accountId,
    //     influencerId: a.influencerId,
    //     socialMedia: String(a.socialMedia ?? "").toLowerCase(),
    //     username: String(a.username ?? ""),
    //     selectedCampaignContentItem: {
    //       campaignContentItemId: a.selectedContent?.campaignContentItemId ?? "",
    //       descriptionId: a.selectedContent?.descriptionId ?? "",
    //     },
    //     dateRequest: a.dateRequest ?? "ASAP",
    //   }));

    //   return {
    //     campaignName,
    //     socialMedia,
    //     campaignPrice,
    //     paymentType: paymentMethod,
    //     addedAccounts,
    //     campaignContent: content,
    //   };
    // },
    setAccountDateRequest: (campaignId, accountKey, dateRequest) => {
      set((state) => {
        const key = String(campaignId ?? "");
        if (!key) return state;

        const prev = state.accountsByCampaignId[key] ?? [];
        const next = prev.map((a) =>
          getDraftAccountKey(a) === accountKey ? { ...a, dateRequest } : a,
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
