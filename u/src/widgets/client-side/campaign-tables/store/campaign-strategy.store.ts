import { create } from "zustand";
import type {
    CampaignContentItem,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types.ts";
import type {
    StrategyStore,
} from "../model/campaign-strategy.types.ts";
import {
    buildFallbackSelectedContent,
    cloneStrategyCampaign,
    createObjectId,
    getAccountKey,
    getGroupBySocial,
    normalizeDescriptions,
    resolveCampaignSocialMedia,
} from "../model/campaign-strategy.helpers.ts";

export const useCampaignStrategyStore = create<StrategyStore>((set, get) => ({
    original: null,
    editable: null,
    rowSelection: {},
    recentlyAddedAccountKeys: [],
    deletingAccountKey: null,

    actions: {
        init: (payload) =>
            set({
                original: cloneStrategyCampaign(payload),
                editable: cloneStrategyCampaign(payload),
                rowSelection: {},
                recentlyAddedAccountKeys: [],
                deletingAccountKey: null,
            }),

        reset: () =>
            set({
                original: null,
                editable: null,
                rowSelection: {},
                recentlyAddedAccountKeys: [],
                deletingAccountKey: null,
            }),

        resetToOriginal: () =>
            set((state) => {
                if (!state.original) return state;

                return {
                    editable: cloneStrategyCampaign(state.original),
                    rowSelection: {},
                    recentlyAddedAccountKeys: [],
                    deletingAccountKey: null,
                };
            }),

        setCampaignName: (value) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignName: value,
                    },
                };
            }),

        setRowSelection: (value) =>
            set({
                rowSelection: value,
            }),

        setDeletingAccountKey: (value) =>
            set({
                deletingAccountKey: value,
            }),

        setAccountDateRequest: (accountId, dateRequest) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        addedAccounts: state.editable.addedAccounts.map((account) =>
                            getAccountKey(account) === String(accountId)
                                ? { ...account, dateRequest }
                                : account,
                        ),
                    },
                };
            }),

        setAccountSelectedContent: (accountId, selected) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        addedAccounts: state.editable.addedAccounts.map((account) =>
                            getAccountKey(account) === String(accountId)
                                ? {
                                    ...account,
                                    selectedCampaignContentItem: selected ?? undefined,
                                }
                                : account,
                        ),
                    },
                };
            }),

        setContentField: (contentId, field, value) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: state.editable.campaignContent.map((item) =>
                            String(item._id) === String(contentId)
                                ? { ...item, [field]: value }
                                : item,
                        ),
                    },
                };
            }),

        setContentDescriptions: (contentId, descriptions) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: state.editable.campaignContent.map((item) =>
                            String(item._id) === String(contentId)
                                ? {
                                    ...item,
                                    descriptions: normalizeDescriptions(descriptions),
                                }
                                : item,
                        ),
                    },
                };
            }),

        addContentDescription: (contentId, text = "") => {
            const descriptionId = createObjectId();

            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: state.editable.campaignContent.map((item) =>
                            String(item._id) === String(contentId)
                                ? {
                                    ...item,
                                    descriptions: [
                                        ...item.descriptions,
                                        {
                                            _id: descriptionId,
                                            description: text,
                                        },
                                    ],
                                }
                                : item,
                        ),
                    },
                };
            });

            return descriptionId;
        },

        updateContentDescription: (contentId, descriptionId, value) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: state.editable.campaignContent.map((item) =>
                            String(item._id) === String(contentId)
                                ? {
                                    ...item,
                                    descriptions: item.descriptions.map((description) =>
                                        String(description._id) === String(descriptionId)
                                            ? { ...description, description: value }
                                            : description,
                                    ),
                                }
                                : item,
                        ),
                    },
                };
            }),

        removeContentDescription: (contentId, descriptionId) =>
            set((state) => {
                if (!state.editable) return state;

                return {
                    editable: {
                        ...state.editable,
                        campaignContent: state.editable.campaignContent.map((item) =>
                            String(item._id) === String(contentId)
                                ? {
                                    ...item,
                                    descriptions: item.descriptions.filter(
                                        (description) =>
                                            String(description._id) !== String(descriptionId),
                                    ),
                                }
                                : item,
                        ),
                    },
                };
            }),

        addContentItem: (socialMedia, payload = {}, inheritFromContentId) => {
            const state = get();
            const editable = state.editable;

            if (!editable) {
                return {
                    contentId: "",
                    firstDescriptionId: "",
                };
            }

            const normalizedSocial = String(socialMedia ?? "").toLowerCase();
            const group = getGroupBySocial(normalizedSocial);

            const base =
                editable.campaignContent.find(
                    (item) => String(item._id) === String(inheritFromContentId),
                ) ??
                editable.campaignContent.find(
                    (item) => String(item.socialMedia ?? "").toLowerCase() === normalizedSocial,
                ) ??
                editable.campaignContent.find(
                    (item) => item.socialMediaGroup === group,
                ) ??
                null;

            const contentId = createObjectId();

            const descriptions =
                payload.descriptions?.length
                    ? normalizeDescriptions(payload.descriptions)
                    : normalizeDescriptions(base?.descriptions);

            const firstDescriptionId = String(descriptions[0]?._id ?? "");

            const nextItem: CampaignContentItem = {
                _id: contentId,
                socialMedia: normalizedSocial,
                socialMediaGroup: group,
                mainLink: String(payload.mainLink ?? base?.mainLink ?? ""),
                descriptions,
                taggedUser: String(payload.taggedUser ?? base?.taggedUser ?? ""),
                taggedLink: String(payload.taggedLink ?? base?.taggedLink ?? ""),
                additionalBrief: String(payload.additionalBrief ?? base?.additionalBrief ?? ""),
                profileType: payload.profileType ?? base?.profileType,
            };

            set((current) => {
                if (!current.editable) return current;

                return {
                    editable: {
                        ...current.editable,
                        socialMedia: resolveCampaignSocialMedia(
                            current.editable.addedAccounts,
                            [...current.editable.campaignContent, nextItem],
                        ),
                        campaignContent: [...current.editable.campaignContent, nextItem],
                    },
                };
            });

            return {
                contentId,
                firstDescriptionId,
            };
        },

        removeContentItem: (contentId) =>
            set((state) => {
                if (!state.editable) return state;

                const nextContent = state.editable.campaignContent.filter(
                    (item) => String(item._id) !== String(contentId),
                );

                const nextAccounts = state.editable.addedAccounts.map((account) => {
                    const selectedContentId =
                        account.selectedCampaignContentItem?.campaignContentItemId ?? "";

                    if (String(selectedContentId) !== String(contentId)) {
                        return account;
                    }

                    return {
                        ...account,
                        selectedCampaignContentItem: buildFallbackSelectedContent(
                            account,
                            nextContent,
                        ) ?? undefined,
                    };
                });

                return {
                    editable: {
                        ...state.editable,
                        socialMedia: resolveCampaignSocialMedia(nextAccounts, nextContent),
                        campaignContent: nextContent,
                        addedAccounts: nextAccounts,
                    },
                };
            }),

        addAccounts: (accounts) =>
            set((state) => {
                if (!state.editable) return state;

                const prevAccounts = state.editable.addedAccounts;
                const prevKeys = new Set(prevAccounts.map(getAccountKey));

                const nextRaw = (accounts ?? []).filter(
                    (account) => !prevKeys.has(getAccountKey(account)),
                );

                if (!nextRaw.length) return state;

                const nextPrepared = nextRaw.map((account) => ({
                    ...account,
                    selectedCampaignContentItem:
                        account.selectedCampaignContentItem ??
                        buildFallbackSelectedContent(account, state.editable!.campaignContent) ??
                        undefined,
                    dateRequest: account.dateRequest ?? "ASAP",
                }));

                const nextAccounts = [...prevAccounts, ...nextPrepared];

                return {
                    editable: {
                        ...state.editable,
                        socialMedia: resolveCampaignSocialMedia(
                            nextAccounts,
                            state.editable.campaignContent,
                        ),
                        addedAccounts: nextAccounts,
                    },
                    recentlyAddedAccountKeys: [
                        ...state.recentlyAddedAccountKeys,
                        ...nextPrepared.map(getAccountKey),
                    ],
                };
            }),

        removeAccount: (accountId) =>
            set((state) => {
                if (!state.editable) return state;

                const removed = state.editable.addedAccounts.find(
                    (account) => getAccountKey(account) === String(accountId),
                );

                if (!removed) return state;

                const nextAccounts = state.editable.addedAccounts.filter(
                    (account) => getAccountKey(account) !== String(accountId),
                );

                const removedGroup = getGroupBySocial(removed.socialMedia);
                const stillHasGroup = nextAccounts.some(
                    (account) => getGroupBySocial(account.socialMedia) === removedGroup,
                );

                const nextContent = stillHasGroup
                    ? state.editable.campaignContent
                    : state.editable.campaignContent.filter(
                        (item) => item.socialMediaGroup !== removedGroup,
                    );

                return {
                    editable: {
                        ...state.editable,
                        socialMedia: resolveCampaignSocialMedia(nextAccounts, nextContent),
                        addedAccounts: nextAccounts,
                        campaignContent: nextContent,
                    },
                    deletingAccountKey: null,
                    recentlyAddedAccountKeys: state.recentlyAddedAccountKeys.filter(
                        (key) => key !== String(accountId),
                    ),
                };
            }),

        markRecentlyAdded: (accountId) =>
            set((state) => ({
                recentlyAddedAccountKeys: [
                    ...state.recentlyAddedAccountKeys,
                    String(accountId),
                ],
            })),

        clearRecentlyAdded: (accountId) =>
            set((state) => ({
                recentlyAddedAccountKeys: state.recentlyAddedAccountKeys.filter(
                    (key) => key !== String(accountId),
                ),
            })),
    },
}));