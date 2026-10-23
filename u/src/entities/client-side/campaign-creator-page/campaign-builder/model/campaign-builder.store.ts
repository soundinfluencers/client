import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ObjectId } from "bson";
import { currencyCode, currencySymbol } from "./selected-offer";
import { calcBuilderTotal, priceForCurrency } from "./calc-builder-total";
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
    totalPriceReady: true,
    unsupportedDraftBundles: false,
    selectedOfferPrice: 0,
    selectedOfferPrices: null,
    selectedOfferIsAvailable: null,
    selectedOfferUnavailableReason: null,
    offerCatalogContext: null,
    selectedCurrency: "€",
} satisfies Omit<CampaignBuilderStore, "actions">;

// Every selection/currency action commits accounts and their display total together.
const recalculate = (state: CampaignBuilderStore): CampaignBuilderStore => {
    const code = currencyCode(state.selectedCurrency);
    const total = calcBuilderTotal(state);
    const totalPriceReady = Number.isSafeInteger(total) && total >= 0 &&
        state.selectedOfferIsAvailable !== false && !state.unsupportedDraftBundles &&
        !state.selectedAccounts.some((account) => account.source === "bundle");
    return {
        ...state,
        totalPrice: totalPriceReady ? total : 0,
        totalPriceReady,
        selectedOfferPrice: state.selectedOfferId ? priceForCurrency(state.selectedOfferPrices, code) : 0,
        selectedPromoCardIds: state.selectedPromoCardIds.filter((id) =>
            !state.selectedOfferAccountIds.includes(id) && state.selectedAccounts.some((a) => a.accountId === id && a.source !== "offer")),
        selectedAccounts: state.selectedAccounts.map((account) => {
            const prices = { ...account.prices };
            if (account.priceCurrency && typeof account.price === "number" && Number.isSafeInteger(account.price) && account.price >= 0 && prices[account.priceCurrency] === undefined) {
                prices[account.priceCurrency] = account.price;
            }
            const price = priceForCurrency(prices, code);
            return { ...account, prices, price: price ?? undefined, priceCurrency: code };
        }),
    };
};

export const useCampaignBuilderStore = create<CampaignBuilderStore>()(
    persist(
        (set) => {
            const update = (change: Partial<CampaignBuilderStore> | ((state: CampaignBuilderStore) => Partial<CampaignBuilderStore>)) =>
                set((state) => {
                    const patch = typeof change === "function" ? change(state) : change;
                    if (Object.entries(patch).every(([key, value]) => Object.is(state[key as keyof CampaignBuilderStore], value))) return state;
                    const next = { ...state, ...patch };
                    const affectsPricing = ["selectedAccounts", "selectedOfferId", "selectedOfferPrices", "selectedOfferAccountIds",
                        "selectedCurrency", "selectedOfferIsAvailable", "unsupportedDraftBundles", "selectedPromoCardIds", "totalPrice"]
                        .some((key) => Object.hasOwn(patch, key));
                    return affectsPricing ? recalculate(next) : next;
                });
            return ({
            ...initialState,

            actions: {
                setCampaignName: (value) => update({ campaignName: value }),
                setSelectedCurrency: (value) => update({ selectedCurrency: currencySymbol(value) }),
                setDraftMeta: ({ draftId, draftStep }) =>
                    update({
                        draftId,
                        draftStep,
                    }),

                selectOffer: ({
                                  offerId,
                                  offerName,
                                  offerPrice,
                                  offerPrices,
                                  accountIds = [],
                                  accounts = [],
                                  catalogContext,
                              }) =>
                    update((state) => {
                        const isSame = state.selectedOfferId === offerId;

                        if (!offerId || isSame) {
                            const nextAccounts = state.selectedAccounts.filter(
                                (account) => account.source !== "offer" && !state.selectedOfferAccountIds.includes(account.accountId),
                            );

                            return {
                                selectedOfferId: null,
                                selectedOfferName: "",
                                selectedOfferPrice: 0,
                                selectedOfferPrices: null,
                                selectedOfferIsAvailable: null,
                                selectedOfferUnavailableReason: null,
                                offerCatalogContext: null,
                                selectedOfferAccountIds: [],
                                selectedAccounts: nextAccounts,
                            };
                        }

                        const membership = new Set(accountIds);
                        const previousMembership = new Set(state.selectedOfferAccountIds);
                        const independent = state.selectedAccounts.filter((account) =>
                            account.source !== "offer" && !previousMembership.has(account.accountId) && !membership.has(account.accountId));
                        const offerAccounts = accountIds.flatMap((id) => {
                            const existing = state.selectedAccounts.filter((account) => account.accountId === id);
                            const catalogueAccount = accounts.find((account) => account.accountId === id);
                            // Preserve ambiguous saved rows for explicit review; never silently collapse them.
                            const rows = existing.length ? existing : accounts.filter((account) => account.accountId === id);
                            return rows.map((account) => ({
                                ...account,
                                ...Object.fromEntries((["countries", "communityMusicGenres", "communityThemeTopics", "creatorMusicGenres", "creatorContentFocus"] as const)
                                    .filter((key) => catalogueAccount?.[key] !== undefined).map((key) => [key, catalogueAccount![key]])),
                                ...(catalogueAccount?.prices ? {
                                    prices: { ...catalogueAccount.prices },
                                    price: undefined,
                                    priceCurrency: undefined,
                                } : {}),
                                selectionId: account.selectionId ?? new ObjectId().toHexString(),
                                source: "offer" as const,
                            }));
                        });
                        return {
                            selectedOfferId: offerId,
                            selectedOfferName: offerName ?? "",
                            selectedOfferPrices: offerPrices ? { ...offerPrices } : typeof offerPrice === "number" ? { EUR: offerPrice } : null,
                            selectedOfferIsAvailable: true,
                            selectedOfferUnavailableReason: null,
                            offerCatalogContext: catalogContext ?? null,
                            selectedOfferAccountIds: [...accountIds],
                            selectedPromoCardIds: state.selectedPromoCardIds.filter((id) => !membership.has(id) && !previousMembership.has(id)),
                            selectedAccounts: [...independent, ...offerAccounts],
                        };
                    }),

                setSelectedPromoCardIds: (ids) =>
                    update({ selectedPromoCardIds: ids }),

                setOfferDisplay: (offerId, name, price) => update((state) =>
                    state.selectedOfferId === offerId && !state.selectedOfferPrices && state.selectedOfferIsAvailable !== false
                        ? { selectedOfferName: name, selectedOfferPrices: { EUR: price } }
                        : {},
                ),

                togglePromoCardId: (id) =>
                    update((state) => {
                        const exists = state.selectedPromoCardIds.includes(id);

                        return {
                            selectedPromoCardIds: exists
                                ? state.selectedPromoCardIds.filter((item) => item !== id)
                                : [...state.selectedPromoCardIds, id],
                        };
                    }),

                setTotalPrice: (value) => update({ totalPrice: value }),

                setSelectedAccounts: (accounts) =>
                    update({ selectedAccounts: accounts.map((a) => ({ ...a, selectionId: a.selectionId ?? new ObjectId().toHexString() })) }),
                removeSelection: (selectionId) => update((state) => ({
                    selectedAccounts: state.selectedAccounts.filter((account) => account.selectionId !== selectionId),
                })),

                upsertSelectedAccount: (account: SelectedCampaignAccount) =>
                    update((state) => {
                        const exists = state.selectedAccounts.some(
                            (item) => item.accountId === account.accountId,
                        );

                        return {
                            selectedAccounts: exists
                                ? state.selectedAccounts.map((item) =>
                                    item.accountId === account.accountId ? { ...account, selectionId: item.selectionId ?? account.selectionId ?? new ObjectId().toHexString() } : item,
                                )
                                : [...state.selectedAccounts, { ...account, selectionId: account.selectionId ?? new ObjectId().toHexString() }],
                        };
                    }),

                togglePromoCard: (account) =>
                    update((state) => {
                        if (state.selectedOfferAccountIds.includes(account.accountId)) return {};
                        account = { ...account, priceCurrency: account.priceCurrency ?? currencyCode(state.selectedCurrency) };
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
                                    { ...account, selectionId: account.selectionId ?? new ObjectId().toHexString(), source: "manual" as const },
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
                    update((state) => ({
                        selectedAccounts: state.selectedAccounts.map((account) =>
                            account.accountId === accountId
                                ? { ...account, selectedCampaignContentItem }
                                : account,
                        ),
                    })),

                setAccountDateRequest: (accountId, dateRequest) =>
                    update((state) => ({
                        selectedAccounts: state.selectedAccounts.map((account) =>
                            account.accountId === accountId
                                ? { ...account, dateRequest }
                                : account,
                        ),
                    })),

                setCampaignContent: (items) =>
                    update({ campaignContent: items }),

                setPostContentDraft: (value) =>
                    update({ postContentDraft: value }),

                setBlocksDraft: (value) =>
                    update({ blocksDraft: value }),

                syncSelectedAccountsContent: (addedAccounts) =>
                    update((state) => ({
                        selectedAccounts: state.selectedAccounts.map((account) => {
                            const matched = addedAccounts.find(
                                (item: any) =>
                                    account.selectionId && item.selectionId ? item.selectionId === account.selectionId :
                                    String(item.socialAccountId) === String(account.accountId) &&
                                    addedAccounts.filter((a) => a.socialAccountId === account.accountId).length === 1,
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
                                       selectedCurrency = "€",
                                       unsupportedDraftBundles = false,
                                       selectedOfferId = null,
                                       selectedOfferAccountIds = [],
                                       selectedOfferName = "",
                                       selectedOfferPrice = null,
                                       selectedOfferPrices = null,
                                       selectedOfferIsAvailable = null,
                                       selectedOfferUnavailableReason = null,
                                       offerCatalogContext = null,
                                       selectedPromoCardIds,
                                       selectedAccounts,
                                       campaignContent,
                                       postContentDraft = null,
                                       blocksDraft = null,
                                   }) =>
                    update({
                        totalPrice,
                        selectedCurrency,
                        unsupportedDraftBundles,
                        draftId,
                        draftStep,
                        campaignName,
                        selectedOfferId,
                        selectedOfferAccountIds,
                        selectedOfferName,
                        selectedOfferPrice,
                        selectedOfferPrices,
                        selectedOfferIsAvailable,
                        selectedOfferUnavailableReason,
                        offerCatalogContext,
                        selectedPromoCardIds,
                        selectedAccounts,
                        selectedOfferAccounts: [],
                        campaignContent,
                        postContentDraft,
                        blocksDraft,
                    }),

                reset: () => update({ ...initialState }),
            },
            });
        },
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
                selectedOfferIsAvailable: state.selectedOfferIsAvailable,
                selectedOfferUnavailableReason: state.selectedOfferUnavailableReason,
                offerCatalogContext: state.offerCatalogContext,
                selectedCurrency: state.selectedCurrency,
                selectedOfferAccountIds: state.selectedOfferAccountIds,
                selectedPromoCardIds: state.selectedPromoCardIds,
                selectedAccounts: state.selectedAccounts,
                campaignContent: state.campaignContent,
                postContentDraft: state.postContentDraft,
                blocksDraft: state.blocksDraft,
                totalPrice: state.totalPrice,
                unsupportedDraftBundles: state.unsupportedDraftBundles,
            }),
            version: 1,
            merge: (persisted, current) => {
                const saved = persisted as Partial<CampaignBuilderStore>;
                return recalculate({ ...current, ...saved, actions: current.actions,
                    selectedAccounts: (saved.selectedAccounts ?? current.selectedAccounts).map((a) => ({
                        ...a, selectionId: a.selectionId ?? new ObjectId().toHexString(),
                    })),
                });
            },
        },
    ),
);
