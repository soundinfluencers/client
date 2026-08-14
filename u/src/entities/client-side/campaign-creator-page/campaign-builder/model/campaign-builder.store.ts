import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
    CampaignBuilderStore,
    SelectedCampaignAccount,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types.ts";
import {
    dedupeSelectedAccounts,
    getSelectedBundleAccountIds,
    normalizeSelectedAccounts,
    removeBundleFromCampaignSelection,
    selectBundleFromCampaignSelection,
    selectOfferFromCampaignSelection,
} from "./campaign-builder-selection";
import {
    buildCampaignCurrencySwitch,
} from "./campaign-builder-currency";

const initialState = {
    campaignName: "",
    draftId: null,
    draftStep: null,

    selectedOfferId: null,
    selectedOfferName: "",
    selectedOfferPrice: undefined,
    selectedOfferPrices: {},
    selectionCurrency: null,
    selectedPromoCardIds: [],
    selectedOfferAccountIds: [],
    selectedAccounts: [],
    selectedOfferAccounts: [],
    selectedBundles: [],
    draftSelectionRows: [],

    campaignContent: [],
    postContentDraft: null,
    blocksDraft: null,
    totalPrice: 0,
    selectedCurrency: "€",
} satisfies Omit<CampaignBuilderStore, "actions">;

export const useCampaignBuilderStore = create<CampaignBuilderStore>()(
    persist(
        (set) => ({
            ...initialState,

            actions: {
                setCampaignName: (value) => set({ campaignName: value }),
                setSelectedCurrency: (value) => set({ selectedCurrency: value }),
                setSelectionCurrency: (value) =>
                    set({ selectionCurrency: value }),
                switchCampaignCurrency: (currency) => {
                    const result = buildCampaignCurrencySwitch(
                        useCampaignBuilderStore.getState(),
                        currency,
                    );

                    if (result.patch) {
                        set(result.patch);
                    }

                    return result.result;
                },
                setDraftMeta: ({ draftId, draftStep }) =>
                    set({
                        draftId,
                        draftStep,
                    }),

                selectOffer: (payload) =>
                    set((state) =>
                        selectOfferFromCampaignSelection({
                            state,
                            payload,
                        }),
                    ),

                selectBundle: (bundle, currency) =>
                    set((state) => {
                        const patch = selectBundleFromCampaignSelection({
                            state,
                            bundle,
                            currency,
                        });

                        return patch ?? state;
                    }),

                removeBundle: (bundleId) =>
                    set((state) => {
                        const patch = removeBundleFromCampaignSelection({
                            state,
                            bundleId,
                        });

                        return patch ?? state;
                    }),

                setSelectedPromoCardIds: (ids) =>
                    set({ selectedPromoCardIds: ids }),

                togglePromoCardId: (id) =>
                    set((state) => {
                        if (
                            getSelectedBundleAccountIds(
                                state.selectedBundles,
                            ).has(id) ||
                            state.selectedOfferAccountIds.includes(id)
                        ) {
                            return state;
                        }

                        const exists = state.selectedPromoCardIds.includes(id);

                        return {
                            selectedPromoCardIds: exists
                                ? state.selectedPromoCardIds.filter((item) => item !== id)
                                : [...state.selectedPromoCardIds, id],
                        };
                    }),

                setTotalPrice: (value) => set({ totalPrice: value }),

                setSelectedAccounts: (accounts) =>
                    set({
                        selectedAccounts:
                            dedupeSelectedAccounts(accounts),
                    }),

                setDraftSelectionRows: (rows) =>
                    set({ draftSelectionRows: rows }),

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

                togglePromoCard: (account, currency) =>
                    set((state) => {
                        if (
                            state.selectionCurrency &&
                            state.selectionCurrency !== currency
                        ) {
                            return state;
                        }

                        if (
                            getSelectedBundleAccountIds(
                                state.selectedBundles,
                            ).has(account.accountId) ||
                            state.selectedOfferAccountIds.includes(
                                account.accountId,
                            )
                        ) {
                            return state;
                        }

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
                            selectionCurrency:
                                state.selectionCurrency ?? currency,
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
                                (item) =>
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

                hydrateFromDraft: (payload) =>
                    set({
                        ...initialState,
                        ...payload,
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
                selectedOfferPrices: state.selectedOfferPrices,
                selectionCurrency: state.selectionCurrency,
                selectedCurrency: state.selectedCurrency,
                selectedOfferAccountIds: state.selectedOfferAccountIds,
                selectedPromoCardIds: state.selectedPromoCardIds,
                selectedAccounts: state.selectedAccounts,
                selectedBundles: state.selectedBundles,
                draftSelectionRows: state.draftSelectionRows,
                campaignContent: state.campaignContent,
                postContentDraft: state.postContentDraft,
                blocksDraft: state.blocksDraft,
                totalPrice: state.totalPrice,
            }),
            version: 1,
            merge: (persistedState, currentState) => {
                const persisted =
                    persistedState as Partial<CampaignBuilderStore>;
                const selectedBundles =
                    persisted.selectedBundles ?? [];
                const draftSelectionRows =
                    persisted.draftSelectionRows ?? [];
                const selectionCurrency =
                    persisted.selectionCurrency ?? null;
                const selectedOfferPrices =
                    persisted.selectedOfferPrices ?? {};
                const selectedOfferPrice =
                    persisted.selectedOfferId && selectionCurrency
                        ? selectedOfferPrices[selectionCurrency] ??
                        persisted.selectedOfferPrice
                        : undefined;
                const selectedPromoCardIds =
                    persisted.selectedPromoCardIds ??
                    currentState.selectedPromoCardIds;
                const selectedOfferAccountIds =
                    persisted.selectedOfferAccountIds ??
                    currentState.selectedOfferAccountIds;
                const persistedAccounts = dedupeSelectedAccounts(
                    persisted.selectedAccounts ??
                        currentState.selectedAccounts,
                );

                return {
                    ...currentState,
                    ...persisted,
                    selectedBundles,
                    draftSelectionRows,
                    selectionCurrency,
                    selectedOfferPrice,
                    selectedOfferPrices,
                    selectedPromoCardIds,
                    selectedOfferAccountIds,
                    selectedAccounts: normalizeSelectedAccounts({
                        currentAccounts: persistedAccounts,
                        selectedPromoCardIds,
                        selectedOfferAccountIds,
                        offerAccounts: persistedAccounts.filter(
                            (account) => account.source === "offer",
                        ),
                        selectedBundles,
                    }),
                    actions: currentState.actions,
                };
            },
        },
    ),
);
