import type {CampaignStoreState, ICampaignAccount} from "./types";
import { calcTotal } from "@/utils/functions/calsTotal";
import { create } from "zustand";


import {
    parseFormsForDisplay,
} from "@/client-side/utils";
import { createJSONStorage, persist } from "zustand/middleware";
import type {CampaignDraftLatestStep} from "@/client-side/types/draft.types.ts";
import {buildCampaignDraftPayload} from "@/client-side/utils/draft.helpers.ts";
import type {ConnectedAccount} from "@/client-side/types/offers.ts";
import {getCampaignContentFromForm} from "@/client-side/utils/get-campaign-content-from-form.ts";


const groupCampaignContentForStore = (campaignContent: any[]) => {
    return campaignContent.reduce(
        (acc, item) => {
            const group = item?.socialMediaGroup;

            if (group === "main" || group === "music" || group === "press") {
                acc[group].push(item);
            }

            return acc;
        },
        {
            main: [] as any[],
            music: [] as any[],
            press: [] as any[],
        },
    );
};

export const useCampaignStore = create<CampaignStoreState>()(
    persist(
        (set, get) => ({
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
            draftId: null,
            draftStep: null,
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
                        const map = new Map<string, ConnectedAccount>();

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
                        const map = new Map<string, ConnectedAccount>();

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

                // buildCampaignContentFromForm: (
                //   formData,
                //   selectedPlatforms,
                //   grouped,
                // ) => {
                //   const campaignContent: any[] = [];
                //
                //   (["main", "music", "press"] as const).forEach((group) => {
                //     grouped[group]?.forEach((platform) => {
                //       if (!selectedPlatforms.includes(platform)) return;
                //
                //       if (group === "main") {
                //         campaignContent.push(
                //           ...buildMainCampaignContent(formData, platform),
                //         );
                //       }
                //
                //       if (group === "music") {
                //         campaignContent.push(
                //           ...buildMusicCampaignContent(formData, platform),
                //         );
                //       }
                //
                //       if (group === "press") {
                //         campaignContent.push(
                //           ...buildPressCampaignContent(formData, platform),
                //         );
                //       }
                //     });
                //   });
                //
                //   set({ campaignContent });
                // },
                setSelectedCampaignContentItem: (
                    accountId: string,
                    selectedCampaignContentItem: {
                        campaignContentItemId: string;
                        descriptionId: string;
                    },
                ) =>
                    set((state) => ({
                        selectedAccounts: state.selectedAccounts.map((account) =>
                            String(account.accountId) === String(accountId)
                                ? {
                                    ...account,
                                    selectedCampaignContentItem,
                                }
                                : account,
                        ),
                    })),
                // buildCampaignContentFromForm: (formData, selectedPlatforms, grouped) => {
                //     const campaignContent = getCampaignContentFromForm(
                //         formData,
                //         selectedPlatforms,
                //         grouped,
                //     );
                //
                //     set({ campaignContent });
                // },

                buildCampaignContentAndSyncAccounts: (formData, selectedPlatforms, grouped) => {
                    const campaignContent = getCampaignContentFromForm(
                        formData,
                        selectedPlatforms,
                        grouped,
                    );

                    const groupedPostContent = groupCampaignContentForStore(campaignContent);

                    set((state) => {
                        const nextAccounts = state.selectedAccounts.map((card) => {
                            const social = String(card.socialMedia || "").toLowerCase();

                            const matchedContent =
                                campaignContent.find(
                                    (item: any) =>
                                        String(item.socialMedia || "").toLowerCase() === social,
                                ) ?? null;

                            const firstDescription = matchedContent?.descriptions?.[0] ?? null;

                            return {
                                ...card,
                                selectedCampaignContentItem: {
                                    campaignContentItemId: String(matchedContent?._id ?? ""),
                                    descriptionId: String(firstDescription?._id ?? ""),
                                },
                            };
                        });

                        return {
                            campaignContent,
                            postContent: groupedPostContent,
                            selectedAccounts: nextAccounts,
                        };
                    });
                },
                buildCampaignContentFromForm: (formData, selectedPlatforms, grouped) => {
                    const campaignContent = getCampaignContentFromForm(
                        formData,
                        selectedPlatforms,
                        grouped,
                    );

                    set((state) => {
                        const nextAccounts = state.selectedAccounts.map((card) => {
                            const social = String(card.socialMedia || "").toLowerCase();

                            const matchedContent =
                                campaignContent.find(
                                    (item: any) =>
                                        String(item.socialMedia || "").toLowerCase() === social,
                                ) ?? null;

                            const firstDescriptionId = String(
                                matchedContent?.descriptions?.[0]?._id ?? "",
                            );

                            return {
                                ...card,
                                selectedCampaignContentItem: {
                                    campaignContentItemId: String(matchedContent?._id ?? ""),
                                    descriptionId: firstDescriptionId,
                                },
                            };
                        });

                        return {
                            campaignContent,
                            selectedAccounts: nextAccounts,
                        };
                    });
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
                            descriptionId:
                                card.selectedCampaignContentItem?.descriptionId ?? "",
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
                // getCampaignPayload: (paymentMethod: string) => {
                //   const state = get();
                //
                //   const addedAccounts = state.selectedAccounts.map((card) => ({
                //     socialAccountId: card.accountId,
                //     influencerId: card.influencerId,
                //     socialMedia: (card.socialMedia || "").toLowerCase(),
                //     username: String(card.username ?? ""),
                //     selectedCampaignContentItem: {
                //       campaignContentItemId:
                //         card.selectedCampaignContentItem?.campaignContentItemId ?? "",
                //       descriptionId:
                //         card.selectedCampaignContentItem?.descriptionId ?? "",
                //     },
                //     dateRequest: card.dateRequest ?? "ASAP",
                //   }));
                //
                //   const socials = Array.from(
                //     new Set(addedAccounts.map((x) => x.socialMedia).filter(Boolean)),
                //   );
                //
                //   const socialMedia =
                //     socials.length > 1 ? "multipromo" : (socials[0] ?? "");
                //
                //   return {
                //     campaignName: state.campaignName ?? "",
                //     socialMedia,
                //     campaignPrice: state.totalPrice ?? 0,
                //     paymentType: paymentMethod,
                //     addedAccounts,
                //     campaignContent: state.campaignContent ?? [],
                //   };
                // },
                setDraftId: (draftId: string | null) => set({ draftId }),
                setDraftStep: (draftStep: CampaignDraftLatestStep | null) => set({ draftStep }),

                getDraftPayload: (step, overrides) => {
                    const state = get();
                    return buildCampaignDraftPayload(state, step, overrides);
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
                        promoCardUI: [],
                        selectedAccounts: [],
                        postContent: { main: [], music: [], press: [] },
                        campaignPayload: null,
                        totalPrice: 0,
                        activeOfferId: null,
                        campaignName: "",
                        campaignContent: [],
                        postContentDraft: null,
                        draftId: null,
                        draftStep: null,
                    }),
            },
        }),

        {
            name: "create-campaign-store",
            storage: createJSONStorage(() => localStorage),

            partialize: (state) => ({
                offer: state.offer,
                promoCard: state.promoCard,
                promoCardUI: state.promoCardUI,
                selectedAccounts: state.selectedAccounts,
                postContent: state.postContent,
                campaignName: state.campaignName,
                campaignContent: state.campaignContent,
                postContentDraft: state.postContentDraft,
                activeOfferId: state.activeOfferId,
                draftId: state.draftId,
                draftStep: state.draftStep,
                totalPrice: state.totalPrice,
            }),

            version: 1,

            migrate: (persisted: any, version) => {
                if (version === 0) return persisted;
                return persisted;
            },
        },
    ),
);
