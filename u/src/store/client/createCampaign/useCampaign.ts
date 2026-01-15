import type { CampaignState } from "@/types/store/index.types";
import { calcTotal } from "@/utils/functions/calsTotal";
import { create } from "zustand";
import { buildCampaignContent, parseFormsForDisplay } from "../utils";

export const useCampaignStore = create<CampaignState>((set, get) => ({
  offer: null,
  promoCard: [],
  postContent: {
    main: [],
    music: [],
    press: [],
  },
  campaignPayload: null,
  totalPrice: 0,
  activeOfferId: null,
  campaignName: "",
  actions: {
    setOffer: (offer) =>
      set((state) => ({
        offer,
        totalPrice: calcTotal(offer, state.promoCard),
      })),

    setActiveOffer: (id) => set({ activeOfferId: id }),

    setPromoCard: (card) =>
      set((state) => {
        const exists = state.promoCard.some(
          (c) => c.accountId === card.accountId
        );
        const promoCard = exists
          ? state.promoCard.map((c) =>
              c.accountId === card.accountId ? card : c
            )
          : [...state.promoCard, card];
        return { promoCard, totalPrice: calcTotal(state.offer, promoCard) };
      }),

    addPostContent: (
      group: "main" | "music" | "press",
      formData: Record<string, string>,
      socialMedia: string
    ) => {
      const parsedForms = parseFormsForDisplay(formData, socialMedia);

      set((state) => ({
        postContent: {
          ...state.postContent,
          [group]: [...state.postContent[group], ...parsedForms],
        },
      }));
    },

    setCampaignName: (campaignName: string) => set({ campaignName }),

    recalcTotal: () => {
      const state = get();
      set({ totalPrice: calcTotal(state.offer, state.promoCard) });
    },

    prepareCampaignPayload: (
      formData: Record<string, string>,
      selectedPlatforms: string[],
      grouped: Record<"main" | "music" | "press", string[]>,
      campaignName?: string,
      campaignPrice?: number
    ) => {
      let campaignContent: any[] = [];

      (["main", "music", "press"] as const).forEach((group) => {
        const platformsInGroup = grouped[group];
        if (!platformsInGroup || platformsInGroup.length === 0) return;

        platformsInGroup.forEach((platform) => {
          if (!selectedPlatforms.includes(platform)) return;

          if (group === "main") {
            campaignContent = campaignContent.concat(
              buildCampaignContent(formData, platform)
            );
          }

          if (group === "music") {
            campaignContent.push({
              _id: `${Date.now()}-${platform}`,
              videoLink: formData["TrackLink"] || "",
              postDescriptions: formData["trackTitle"]
                ? [
                    {
                      _id: `${Date.now()}-0`,
                      description: formData["trackTitle"],
                    },
                  ]
                : [],
              storyTag: "",
              swipeUpLink: "",
              specialWishes: formData["additionalBrief"] || "",
              socialMedia: platform,
              socialMediaGroup: group,
            });
          }

          if (group === "press") {
            campaignContent.push({
              _id: `${Date.now()}-${platform}`,
              videoLink: formData["musicLinks"] || "",
              postDescriptions: formData["artworkLinks"]
                ? [
                    {
                      _id: `${Date.now()}-0`,
                      description: formData["artworkLinks"],
                    },
                  ]
                : [],
              storyTag: "",
              swipeUpLink: "",
              specialWishes: formData["additionalBrief"] || "",
              socialMedia: platform,
              socialMediaGroup: group,
            });
          }
        });
      });

      const payload = {
        campaignContent,
        campaignName: campaignName || formData["campaignName"] || "",
        paymentType: "card",
        paymentStatus: "wait",
        campaignPrice: campaignPrice || 0,
        createdAt: new Date().toISOString(),
        socialMedia: "",
      };

      set({ campaignPayload: payload });
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
