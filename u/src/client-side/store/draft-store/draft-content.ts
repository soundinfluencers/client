import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CampaignAddedAccount } from "@/types/store/index.types";
import { ObjectId } from "bson";
import { getGroupBySocial } from "@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced";
import { buildProposalPatchBody } from "@/client-side/utils";
import { calcBuilderTotal } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/calc-builder-total";
import { assertSupportedSelections, serializeSelectedOffer, type DraftSelectedOffer } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";

export const getDraftAccountKey = (n: CampaignAddedAccount | any) =>
    String(
        n?.selectionId ?? n?.addedAccountsId ??
        n?.socialAccountId ??
        n?.accountId ??
        n?._id ??
        n?.id ??
        "",
    );
const oid = () => new ObjectId().toHexString();
type CampaignContentItem = {
  _id: string;
  socialMedia?: string;
  socialMediaGroup: "main" | "music" | "press";
  descriptions?: Array<{ _id: string; description?: string }>;
  mainLink?: string;
  taggedUser?: string;
  taggedLink?: string;
  additionalBrief?: Array<{ _id: string; additionalBrief: string }>;
};

type DraftCampaignStore = {
  metadataByDraftId: Record<string, { campaignName: string; selectedOffer: DraftSelectedOffer | null; displayCurrency: "EUR" | "USD" | "GBP" }>;
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
    opts?: { force?: boolean; campaignName?: string; selectedOffer?: DraftSelectedOffer | null; displayCurrency?: "EUR" | "USD" | "GBP" },
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
  setAccountSelectedContent: (
      campaignId: string,
      accountKey: string,
      selected: {
        campaignContentItemId: string;
        descriptionId: string;
        additionalBriefId?: string;
      },
  ) => void;
  clearCampaign: (campaignId: string) => void;
  updateContentMainLink: (
      campaignId: string,
      contentId: string,
      mainLink: string,
  ) => void;
};

export const useDraftCampaignStore = create<DraftCampaignStore>()(
  devtools((set, get) => ({
    accountsByCampaignId: {},
    contentByCampaignId: {},
    payloadByDraftId: {},
    metadataByDraftId: {},

    initCampaign: (campaignId, serverAccounts, serverContent, opts) => {
      set((state) => {
        const key = String(campaignId ?? "");
        if (!key) return state;

        const exists =
          state.contentByCampaignId[key] || state.accountsByCampaignId[key];
        if (exists && !opts?.force) return state;

        return {
          metadataByDraftId: {
            ...state.metadataByDraftId,
            [key]: { campaignName: opts?.campaignName ?? "", selectedOffer: opts?.selectedOffer ?? null, displayCurrency: opts?.displayCurrency ?? "EUR" },
          },
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
    updateContentMainLink: (campaignId, contentId, mainLink) => {
      const key = String(campaignId ?? "");
      if (!key) return;

      set((state) => {
        const prev = state.contentByCampaignId[key] ?? [];

        const next = prev.map((item) =>
            String(item._id) === String(contentId)
                ? { ...item, mainLink }
                : item,
        );

        return {
          contentByCampaignId: {
            ...state.contentByCampaignId,
            [key]: next,
          },
        };
      });
    },
    setAccountSelectedContent: (campaignId, accountKey, selected) => {
      set((state) => {
        const key = String(campaignId ?? "");
        if (!key) return state;

        const prev = state.accountsByCampaignId[key] ?? [];

        const next = prev.map((account: any) =>
            getDraftAccountKey(account) === String(accountKey)
                ? {
                  ...account,
                  selectedContent: selected,
                  selectedCampaignContentItem: selected,
                }
                : account,
        );

        return {
          accountsByCampaignId: {
            ...state.accountsByCampaignId,
            [key]: next,
          },
        };
      });
    },
    getCampaignPrice: (campaignId) => {
      const state = get();
      const accounts = state.accountsByCampaignId[campaignId] ?? [];
      const meta = state.metadataByDraftId[campaignId];
      return calcBuilderTotal({
        selectedOfferId: meta?.selectedOffer?.offerId ?? null,
        selectedOfferAccountIds: meta?.selectedOffer?.selectedAccountIds ?? [],
        selectedOfferPrices: meta?.selectedOffer?.prices,
        selectedCurrency: meta?.displayCurrency ?? "EUR",
        selectedAccounts: accounts.map((a: any) => ({ ...a, accountId: a.socialAccountId })),
      });
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
      const currency = state.metadataByDraftId[campaignId]?.displayCurrency ?? "EUR";
      const amount = state.getCampaignPrice(campaignId);

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

      if (!st.accountsByCampaignId[id] || !st.contentByCampaignId[id]) {
        throw new Error("Please open this draft before proceeding to payment.");
      }
      const metadata = st.metadataByDraftId[id];

      const accounts = st.accountsByCampaignId[id] ?? [];
      assertSupportedSelections(accounts as Array<{ source?: string; bundleId?: string }>);
      const content = st.contentByCampaignId[id] ?? [];
      const preparedAccounts = accounts.map((a: any) => {
        const sm = String(a.socialMedia ?? "").toLowerCase();

        const item =
            content.find((c: any) => String(c.socialMedia ?? "").toLowerCase() === sm) ??
            content.find(
                (c: any) =>
                    String(c.socialMediaGroup ?? "") === getGroupBySocial(sm),
            ) ??
            content.find((c: any) => String(c.socialMediaGroup ?? "") === "main") ??
            content[0];

        return {
          ...a,
          selectedContent:
              item?._id && item?.descriptions?.[0]?._id
                  ? {
                    campaignContentItemId: String(item._id),
                    descriptionId: String(item.descriptions[0]._id),
                  }
                  : null,
          dateRequest: a.dateRequest ?? "ASAP",
        };
      });
      const body = buildProposalPatchBody({
        campaignName: metadata?.campaignName || campaignName,
        accounts: preparedAccounts,
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

      // Restore exact saved references after the shared legacy content mapper.
      // Do not let its proposal defaults replace a saved null/second variant.
      body.addedAccounts = body.addedAccounts.map((row: any) => {
        const originals = accounts.filter((a: any) => a.socialAccountId === row.socialAccountId);
        const saved = originals.length === 1 ? originals[0].selectedCampaignContentItem : null;
        return saved ? { ...row, selectedCampaignContentItem: { ...saved } } : row;
      });
      const campaignPrice = st.getCampaignPrice(id);

      return {
        ...body, // campaignName, addedAccounts, campaignContent
        socialMedia,
        campaignPrice,
        displayCurrency: metadata?.displayCurrency ?? "EUR",
        selectedOffer: serializeSelectedOffer(metadata?.selectedOffer, body.addedAccounts, metadata?.selectedOffer?.isAvailable),
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
        console.log("UPDATED IN STORE", next);
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
            _id: oid(),
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
        const nextMetadata = { ...state.metadataByDraftId };
        const nextPayload = { ...state.payloadByDraftId };
        delete nextAcc[key];
        delete nextContent[key];
        delete nextMetadata[key];
        delete nextPayload[key];

        return {
          accountsByCampaignId: nextAcc,
          contentByCampaignId: nextContent,
          metadataByDraftId: nextMetadata,
          payloadByDraftId: nextPayload,
        };
      });
    },
  })),
);
