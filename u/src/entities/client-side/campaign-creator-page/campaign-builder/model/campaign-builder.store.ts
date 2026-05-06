import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
    CampaignBuilderStore,
    SelectedCampaignAccount,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types.ts";

const initialState = {
    campaignName: "",
    draftId: null,
    draftStep: null,

    selectedOfferId: null,
    selectedOfferName: "",
    selectedPromoCardIds: [],
    selectedOfferAccountIds: [],
    selectedAccounts: [],
    selectedOfferAccounts: [],

    campaignContent: [],
    postContentDraft: null,
    blocksDraft: null,
    totalPrice: 0,
    selectedOfferPrice: 0,
} satisfies Omit<CampaignBuilderStore, "actions">;

export const useCampaignBuilderStore = create<CampaignBuilderStore>()(
    persist(
        (set) => ({
            ...initialState,

            actions: {
                setCampaignName: (value) => set({ campaignName: value }),

                setDraftMeta: ({ draftId, draftStep }) =>
                    set({
                        draftId,
                        draftStep,
                    }),

                selectOffer: ({
                                  offerId,
                                  offerName,
                                  offerPrice = 0,
                                  accountIds = [],
                                  accounts = [],
                              }) =>
                    set((state) => {
                        const isSame = state.selectedOfferId === offerId;

                        if (!offerId || isSame) {
                            const nextAccounts = state.selectedAccounts.filter(
                                (account) => account.source !== "offer",
                            );

                            return {
                                selectedOfferId: null,
                                selectedOfferName: "",
                                selectedOfferPrice: 0,
                                selectedOfferAccountIds: [],
                                selectedAccounts: nextAccounts,
                            };
                        }

                        const manualAccounts = state.selectedAccounts.filter(
                            (account) => account.source !== "offer",
                        );

                        const manualIds = new Set(
                            manualAccounts.map((account) => account.accountId),
                        );

                        const offerAccountsToAdd = accounts
                            .filter((account) => !manualIds.has(account.accountId))
                            .map((account) => ({
                                ...account,
                                source: "offer" as const,
                            }));

                        return {
                            selectedOfferId: offerId,
                            selectedOfferName: offerName ?? "",
                            selectedOfferPrice: offerPrice ?? 0,
                            selectedOfferAccountIds: accountIds,
                            selectedAccounts: [...manualAccounts, ...offerAccountsToAdd],
                        };
                    }),

                setSelectedPromoCardIds: (ids) =>
                    set({ selectedPromoCardIds: ids }),

                togglePromoCardId: (id) =>
                    set((state) => {
                        const exists = state.selectedPromoCardIds.includes(id);

                        return {
                            selectedPromoCardIds: exists
                                ? state.selectedPromoCardIds.filter((item) => item !== id)
                                : [...state.selectedPromoCardIds, id],
                        };
                    }),

                setTotalPrice: (value) => set({ totalPrice: value }),

                setSelectedAccounts: (accounts) =>
                    set({ selectedAccounts: accounts }),

                upsertSelectedAccount: (account: SelectedCampaignAccount) =>
                    set((state) => {
                        const exists = state.selectedAccounts.some(
                            (item) => item.accountId === account.accountId,
                        );

                        return {
                            selectedAccounts: exists
                                ? state.selectedAccounts.map((item) =>
                                    item.accountId === account.accountId ? account : item,
                                )
                                : [...state.selectedAccounts, account],
                        };
                    }),

                togglePromoCard: (account) =>
                    set((state) => {
                        const existing = state.selectedAccounts.find(
                            (item) => item.accountId === account.accountId,
                        );

                        const existsInPromoIds = state.selectedPromoCardIds.includes(
                            account.accountId,
                        );

                        const nextPromoIds = existsInPromoIds
                            ? state.selectedPromoCardIds.filter(
                                (id) => id !== account.accountId,
                            )
                            : [...state.selectedPromoCardIds, account.accountId];

                        let nextAccounts = state.selectedAccounts;

                        if (existsInPromoIds) {
                            if (existing?.source === "manual") {
                                nextAccounts = state.selectedAccounts.filter(
                                    (item) => item.accountId !== account.accountId,
                                );
                            }
                        } else {
                            if (existing) {
                                nextAccounts = state.selectedAccounts.map((item) =>
                                    item.accountId === account.accountId
                                        ? { ...item, ...account, source: "manual" }
                                        : item,
                                );
                            } else {
                                nextAccounts = [
                                    ...state.selectedAccounts,
                                    { ...account, source: "manual" as const },
                                ];
                            }
                        }

                        return {
                            selectedPromoCardIds: nextPromoIds,
                            selectedAccounts: nextAccounts,
                        };
                    }),

                setSelectedCampaignContentItem: (
                    accountId,
                    selectedCampaignContentItem,
                ) =>
                    set((state) => ({
                        selectedAccounts: state.selectedAccounts.map((account) =>
                            account.accountId === accountId
                                ? { ...account, selectedCampaignContentItem }
                                : account,
                        ),
                    })),

                setAccountDateRequest: (accountId, dateRequest) =>
                    set((state) => ({
                        selectedAccounts: state.selectedAccounts.map((account) =>
                            account.accountId === accountId
                                ? { ...account, dateRequest }
                                : account,
                        ),
                    })),

                setCampaignContent: (items) =>
                    set({ campaignContent: items }),

                setPostContentDraft: (value) =>
                    set({ postContentDraft: value }),

                setBlocksDraft: (value) =>
                    set({ blocksDraft: value }),

                syncSelectedAccountsContent: (addedAccounts) =>
                    set((state) => ({
                        selectedAccounts: state.selectedAccounts.map((account) => {
                            const matched = addedAccounts.find(
                                (item: any) =>
                                    String(item.socialAccountId) === String(account.accountId),
                            );

                            if (!matched) return account;

                            return {
                                ...account,
                                selectedCampaignContentItem:
                                    matched.selectedCampaignContentItem ?? null,
                                dateRequest:
                                    matched.dateRequest ?? account.dateRequest ?? "ASAP",
                                profileType:
                                    matched.profileType ?? account.profileType,
                            };
                        }),
                    })),

                hydrateFromDraft: ({
                                       draftId,
                                       draftStep,
                                       campaignName,
                                       totalPrice = 0,
                                       selectedOfferId = null,
                                       selectedOfferAccountIds = [],
                                       selectedPromoCardIds,
                                       selectedAccounts,
                                       campaignContent,
                                       postContentDraft = null,
                                       blocksDraft = null,
                                   }) =>
                    set({
                        totalPrice,
                        draftId,
                        draftStep,
                        campaignName,
                        selectedOfferId,
                        selectedOfferAccountIds,
                        selectedPromoCardIds,
                        selectedAccounts,
                        campaignContent,
                        postContentDraft,
                        blocksDraft,
                    }),

                reset: () => set({ ...initialState }),
            },
        }),
        {
            name: "campaign-builder-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                campaignName: state.campaignName,
                draftId: state.draftId,
                draftStep: state.draftStep,
                selectedOfferId: state.selectedOfferId,
                selectedOfferName: state.selectedOfferName,
                selectedOfferPrice: state.selectedOfferPrice,
                selectedOfferAccountIds: state.selectedOfferAccountIds,
                selectedPromoCardIds: state.selectedPromoCardIds,
                selectedAccounts: state.selectedAccounts,
                campaignContent: state.campaignContent,
                postContentDraft: state.postContentDraft,
                blocksDraft: state.blocksDraft,
                totalPrice: state.totalPrice,
            }),
            version: 1,
        },
    ),
);