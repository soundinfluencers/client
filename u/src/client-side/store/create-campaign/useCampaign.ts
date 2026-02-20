import type { CampaignState } from "@/types/store/index.types";
import { calcTotal } from "@/utils/functions/calsTotal";
import { create } from "zustand";

import type {
  ICampaignAccount,
  IPromoCard,
} from "@/types/client/creator-campaign/creator-campaign.types";
import {
  parseFormsForDisplay,
  buildMainCampaignContent,
  buildMusicCampaignContent,
  buildPressCampaignContent,
} from "@/client-side/utils";

export const useCampaignStore = create<CampaignState>((set, get) => ({
  offer: null,
  promoCard: [],
  promoCardUI: [],
  selectedAccounts: [],
  postContent: {
    main: [],
    music: [],
    press: [],
  },
  campaignPayload: null,
  totalPrice: 0,
  activeOfferId: null,
  campaignName: "",
  campaignContent: [],
  postContentDraft: null,

  actions: {
    setPostContentDraft: (v) => set({ postContentDraft: v }),

    clearPostContentDraft: () => set({ postContentDraft: null }),
    clearPostContentAll: () =>
      set({
        postContentDraft: null,
        postContent: { main: [], music: [], press: [] },
        campaignContent: [],
      }),
    setOffer: (offer) =>
      set((state) => {
        const incomingId = String((offer as any)?._id ?? "");
        const currentId = String((state.offer as any)?._id ?? "");

        const isSame = incomingId && incomingId === currentId;

        if (isSame) {
          return {
            offer: null,
            activeOfferId: null,
            promoCard: [],
            totalPrice: calcTotal(null, []),
          };
        }

        return {
          offer,
          activeOfferId: incomingId || null,
          promoCard: [],
          totalPrice: calcTotal(offer, []),
        };
      }),

    setActiveOffer: (id) => set({ activeOfferId: id }),

    setPromoCards: (cards) =>
      set((state) => {
        const incoming = Array.isArray(cards) ? cards : [cards];
        const map = new Map<string, IPromoCard>();

        state.promoCard.forEach((card) => {
          if (card?.accountId) map.set(card.accountId, card);
        });

        incoming.forEach((card) => {
          const id = card?.accountId;
          if (!id) return;

          if (map.has(id)) map.delete(id);
          else map.set(id, card);
        });

        const promoCard = Array.from(map.values());

        return {
          promoCard,
          totalPrice: calcTotal(state.offer, promoCard),
        };
      }),
    setPromoCardsUI: (cards) =>
      set((state) => {
        const incoming = Array.isArray(cards) ? cards : [cards];
        const map = new Map<string, IPromoCard>();

        state.promoCardUI.forEach((card) => {
          if (card?.accountId) map.set(card.accountId, card);
        });

        incoming.forEach((card) => {
          const id = card?.accountId;
          if (!id) return;

          if (map.has(id)) map.delete(id);
          else map.set(id, card);
        });

        const promoCardUI = Array.from(map.values());

        return {
          promoCardUI,
        };
      }),
    setCampaignAccount: (account: ICampaignAccount) =>
      set((state) => {
        const exists = state.selectedAccounts.some(
          (a) => a.accountId === account.accountId,
        );

        return {
          selectedAccounts: exists
            ? state.selectedAccounts.map((a) =>
                a.accountId === account.accountId ? account : a,
              )
            : [...state.selectedAccounts, account],
        };
      }),

    addPostContent: (group, formData, socialMedia) => {
      const parsed = parseFormsForDisplay(formData, socialMedia, group);

      set((state) => {
        const prev = state.postContent[group];

        const ids = new Set(parsed.map((x: any) => x._id));
        const withoutSameIds = prev.filter((it: any) => !ids.has(it._id));

        return {
          postContent: {
            ...state.postContent,
            [group]: [...withoutSameIds, ...parsed],
          },
        };
      });
    },
    setCampaignName: (campaignName: string) => set({ campaignName }),

    buildCampaignContentFromForm: (formData, selectedPlatforms, grouped) => {
      const campaignContent: any[] = [];

      (["main", "music", "press"] as const).forEach((group) => {
        grouped[group]?.forEach((platform) => {
          if (!selectedPlatforms.includes(platform)) return;

          if (group === "main") {
            campaignContent.push(
              ...buildMainCampaignContent(formData, platform),
            );
          }

          if (group === "music") {
            campaignContent.push(
              ...buildMusicCampaignContent(formData, platform),
            );
          }

          if (group === "press") {
            campaignContent.push(
              ...buildPressCampaignContent(formData, platform),
            );
          }
        });
      });

      set({ campaignContent });
    },
    getCampaignPayload: (paymentMethod: string) => {
      const state = get();

      const addedAccounts = state.selectedAccounts.map((card) => ({
        socialAccountId: card.accountId,
        influencerId: card.influencerId,
        socialMedia: (card.socialMedia || "").toLowerCase(),
        username: String(card.username ?? ""),
        selectedCampaignContentItem: {
          campaignContentItemId:
            card.selectedCampaignContentItem?.campaignContentItemId ?? "",
          descriptionId: card.selectedCampaignContentItem?.descriptionId ?? "",
        },
        dateRequest: card.dateRequest ?? "ASAP",
      }));

      const socials = Array.from(
        new Set(addedAccounts.map((x) => x.socialMedia).filter(Boolean)),
      );

      const socialMedia =
        socials.length > 1 ? "multipromo" : (socials[0] ?? "");

      return {
        campaignName: state.campaignName ?? "",
        socialMedia,
        campaignPrice: state.totalPrice ?? 0,
        paymentType: paymentMethod,
        addedAccounts,
        campaignContent: state.campaignContent ?? [],
      };
    },
    getDraftPayload: () => {
      const state = get();

      const firstFromContent = state.campaignContent?.[0]?.socialMedia;
      const firstFromAccounts = state.selectedAccounts?.[0]?.socialMedia;
      const fromOffer = state.offer?.socialMedia;

      const draftSocialMedia = String(
        firstFromContent || firstFromAccounts || fromOffer || "instagram",
      ).toLowerCase();

      return {
        campaignName: state.campaignName ?? "",
        socialMedia: draftSocialMedia,
        campaignContent: state.campaignContent ?? [],

        addedAccounts: state.selectedAccounts.map((a) => ({
          influencerId: a.influencerId,
          socialAccountId: a.accountId,
          socialMedia: (a.socialMedia || draftSocialMedia).toLowerCase(),
          username: String(a.username ?? ""),

          selectedContent: {
            campaignContentItemId:
              a.selectedCampaignContentItem?.campaignContentItemId ?? "",
            descriptionId: a.selectedCampaignContentItem?.descriptionId ?? "",
          },
        })),
      };
    },
    getProposalPayload: () => {
      const state = get();

      const addedAccounts = state.selectedAccounts.map((a) => ({
        socialAccountId: a.accountId,
        influencerId: a.influencerId,
        socialMedia: (a.socialMedia || "instagram").toLowerCase(),
        username: String(a.username ?? ""),
        selectedCampaignContentItem: {
          campaignContentItemId:
            a.selectedCampaignContentItem?.campaignContentItemId ?? "",
          descriptionId: a.selectedCampaignContentItem?.descriptionId ?? "",
        },
        dateRequest: a.dateRequest ?? "ASAP",
      }));
      console.log(addedAccounts, "addAc");
      const socials = Array.from(
        new Set(addedAccounts.map((x) => x.socialMedia).filter(Boolean)),
      );
      const socialMedia =
        socials.length > 1 ? "multipromo" : (socials[0] ?? "instagram");

      return {
        campaignName: state.campaignName ?? "",
        socialMedia,
        campaignPrice: state.totalPrice ?? 0,
        addedAccounts,
        paymentType: "",
        campaignContent: state.campaignContent ?? [],
      };
    },

    resetCampaign: () =>
      set({
        offer: null,
        promoCard: [],
        postContent: { main: [], music: [], press: [] },
        campaignPayload: null,
        totalPrice: 0,
        activeOfferId: null,
        campaignName: "",
      }),
  },
}));
