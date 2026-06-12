import { create } from "zustand";

export const getGroupBySocial = (
    social: string,
): "main" | "music" | "press" => {
    const s = String(social ?? "").toLowerCase();

    if (["facebook", "instagram", "youtube", "tiktok"].includes(s)) {
        return "main";
    }

    if (["spotify", "soundcloud"].includes(s)) {
        return "music";
    }

    return "press";
};

export type CampaignKind = "regular" | "proposal";

export type SelectedCampaignContentItem = {
    campaignContentItemId: string;
    descriptionId: string;
};

export type EditableDescription = {
    _id: string;
    description: string;
};

export type EditableCampaignContentItem = {
    _id: string;
    socialMedia: string;
    profileType?: string;
    socialMediaGroup: string;
    mainLink: string;
    mediaCache?: {
        provider?: string;
        kind?: string;
        items?: any[];
        cachedAt?: string;
    };
    descriptions: EditableDescription[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
};

export type EditableCampaignAccount = {
    __clientId?: string;
    addedAccountsId?: string;

    socialAccountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;

    publicPrice: number;
    followers: number;

    genres: string[];
    countries: any[];
    logoUrl: string;
    profileType: string;

    selectedCampaignContentItem: SelectedCampaignContentItem | null;
    selectedContent?: SelectedCampaignContentItem | null;
    selectedContentItem?: any;

    confirmation: string;
    closePromo: string;

    dateRequest: string;
    datePost: string;

    postLink: string;
    screenshot: string;

    impressions: number;
    like: number;
    comments: number;
    shares: number;
    saves: number;
    rating: number;
};

export type EditableCampaign = {
    kind: CampaignKind;

    campaignId: string;
    campaignName: string;
    socialMedia: string;

    optionIndex: number | null;
    existingOptions: number[];

    status: string;
    creationDate: string;

    price: number;
    displayCurrency: string;

    addedAccounts: EditableCampaignAccount[];
    campaignContent: EditableCampaignContentItem[];

    shareLink: string;

    totalFollowers: number;
    totalImpressions: number;
    totalLikes: number;
    totalSaves: number;
    totalComments: number;
    totalShares: number;

    isCpmAndResultHidden: boolean;
    isPriceHidden: boolean;
    hiddenColumns: string[];

    cpm: number | null;
    canEdit: boolean;
};

export type CampaignAccountSavePayload = {
    addedAccountsId?: string;
    socialAccountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    selectedCampaignContentItem: SelectedCampaignContentItem | null;
    dateRequest: string;
};

export type CampaignContentSavePayload = {
    _id: string;
    socialMedia: string;
    profileType?: string;
    socialMediaGroup: string;
    mainLink: string;
    descriptions: EditableDescription[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
};

export type ProposalCampaignSavePayload = {
    campaignName: string;
    isCpmAndResultHidden: boolean;
    isPriceHidden: boolean;
    addedAccounts: CampaignAccountSavePayload[];
    campaignContent: CampaignContentSavePayload[];
};

export type RegularCampaignSavePayload = {
    isCpmAndResultHidden: boolean;
    isPriceHidden: boolean;
};

export type CampaignSavePayload =
    | ProposalCampaignSavePayload
    | RegularCampaignSavePayload;

export type InitCampaignPayload = any;

type InitCampaignParams = {
    status?: string;
    optionIndex?: number;
};

const toStringSafe = (value: unknown) => String(value ?? "");

const normalizeStatus = (status: unknown) => {
    return String(status ?? "").trim().toLowerCase();
};

const getKindByStatus = (status: unknown): CampaignKind => {
    return normalizeStatus(status) === "proposal" ? "proposal" : "regular";
};

const objectId = () => {
    const bytes = new Uint8Array(12);

    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < 12; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }

    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

const ensureClientIds = (accounts: any[]) => {
    const usedIds = new Set<string>();

    return (accounts ?? []).map((account) => {
        const backendAddedId = String(account?.addedAccountsId ?? "");

        let clientId = String(account?.__clientId ?? backendAddedId ?? "");

        if (!clientId || usedIds.has(clientId)) {
            clientId = objectId();
        }

        usedIds.add(clientId);

        return {
            ...account,
            addedAccountsId: backendAddedId || undefined,
            __clientId: clientId,
        };
    });
};

export const getCampaignAccountKey = (account: any) =>
    String(
        account?.__clientId ??
        account?.addedAccountsId ??
        account?.socialAccountId ??
        account?.accountId ??
        account?._id ??
        "",
    );

const getAutoPriceFromAccounts = (accounts: EditableCampaignAccount[]) => {
    return (accounts ?? []).reduce((sum, account) => {
        return sum + Number(account.publicPrice ?? 0);
    }, 0);
};

const normalizeSelected = (account: any): SelectedCampaignContentItem | null => {
    const selected =
        account?.selectedCampaignContentItem ?? account?.selectedContent ?? null;

    if (!selected?.campaignContentItemId || !selected?.descriptionId) {
        return null;
    }

    return {
        campaignContentItemId: toStringSafe(selected.campaignContentItemId),
        descriptionId: toStringSafe(selected.descriptionId),
    };
};

const normalizeAccount = (account: any): EditableCampaignAccount => {
    const selected = normalizeSelected(account);

    return {
        ...account,

        addedAccountsId: account?.addedAccountsId
            ? toStringSafe(account.addedAccountsId)
            : undefined,

        __clientId: account?.__clientId || account?.addedAccountsId || objectId(),

        socialAccountId: toStringSafe(
            account?.socialAccountId || account?.accountId,
        ),
        influencerId: toStringSafe(account?.influencerId),
        socialMedia: toStringSafe(account?.socialMedia).toLowerCase(),
        username: toStringSafe(account?.username),

        publicPrice: Number(account?.publicPrice ?? account?.price ?? 0),
        followers: Number(account?.followers ?? 0),

        genres: Array.isArray(account?.genres) ? account.genres : [],
        countries: Array.isArray(account?.countries) ? account.countries : [],
        logoUrl: toStringSafe(account?.logoUrl),
        profileType: toStringSafe(account?.profileType),

        selectedCampaignContentItem: selected,
        selectedContent: selected,
        selectedContentItem: account?.selectedContentItem ?? null,

        confirmation: toStringSafe(account?.confirmation),
        closePromo: toStringSafe(account?.closePromo),

        dateRequest: toStringSafe(account?.dateRequest || "ASAP"),
        datePost: toStringSafe(account?.datePost),

        postLink: toStringSafe(account?.postLink),
        screenshot: toStringSafe(account?.screenshot),

        impressions: Number(account?.impressions ?? 0),
        like: Number(account?.like ?? 0),
        comments: Number(account?.comments ?? 0),
        shares: Number(account?.shares ?? 0),
        saves: Number(account?.saves ?? 0),
        rating: Number(account?.rating ?? 0),
    };
};

const normalizeContentItem = (item: any): EditableCampaignContentItem => ({
    _id: toStringSafe(item?._id || objectId()),
    socialMedia: toStringSafe(item?.socialMedia).toLowerCase(),
    profileType: item?.profileType ? toStringSafe(item.profileType) : undefined,
    socialMediaGroup: toStringSafe(
        item?.socialMediaGroup || getGroupBySocial(item?.socialMedia),
    ),
    mainLink: toStringSafe(item?.mainLink),
    mediaCache: item?.mediaCache ?? undefined,
    descriptions: Array.isArray(item?.descriptions)
        ? item.descriptions.map((description: any) => ({
            _id: toStringSafe(description?._id || objectId()),
            description: toStringSafe(description?.description),
        }))
        : [],
    taggedUser: toStringSafe(item?.taggedUser),
    taggedLink: toStringSafe(item?.taggedLink),
    additionalBrief: toStringSafe(item?.additionalBrief),
});

export const normalizeCampaignForStore = (
    data: InitCampaignPayload,
    params?: InitCampaignParams,
): EditableCampaign => {
    const status = normalizeStatus(params?.status ?? data?.status);
    const kind = getKindByStatus(status);

    const selectedOption = kind === "proposal" ? data?.selectedOption ?? {} : null;

    const accountsSource =
        kind === "proposal"
            ? selectedOption?.addedAccounts
            : data?.addedAccounts;

    const contentSource =
        kind === "proposal"
            ? selectedOption?.campaignContent
            : data?.campaignContent;

    const priceSource =
        kind === "proposal"
            ? selectedOption?.price
            : data?.price;

    const canEditSource =
        kind === "proposal"
            ? selectedOption?.canEdit
            : data?.canEdit;

    const normalizedAccounts = ensureClientIds(
        (accountsSource ?? []).map(normalizeAccount),
    );

    const normalizedContent = (contentSource ?? []).map(normalizeContentItem);

    const optionIndex =
        kind === "proposal"
            ? Number(selectedOption?.optionIndex ?? params?.optionIndex ?? 0)
            : null;

    return {
        kind,

        campaignId: toStringSafe(data?.campaignId),
        campaignName: toStringSafe(data?.campaignName),
        socialMedia: toStringSafe(data?.socialMedia).toLowerCase(),

        optionIndex,

        existingOptions: Array.isArray(data?.existingOptions)
            ? data.existingOptions
                .map(Number)
                .filter((item: number) => !Number.isNaN(item))
            : kind === "proposal"
                ? [optionIndex ?? 0]
                : [],

        status,
        creationDate: toStringSafe(data?.creationDate),

        price: Number(
            priceSource ??
            data?.price ??
            getAutoPriceFromAccounts(normalizedAccounts),
        ),

        displayCurrency: toStringSafe(data?.displayCurrency || "EUR"),

        addedAccounts: normalizedAccounts,
        campaignContent: normalizedContent,

        shareLink: toStringSafe(data?.shareLink),

        totalFollowers: Number(data?.totalFollowers ?? 0),
        totalImpressions: Number(data?.totalImpressions ?? 0),
        totalLikes: Number(data?.totalLikes ?? 0),
        totalSaves: Number(data?.totalSaves ?? 0),
        totalComments: Number(data?.totalComments ?? 0),
        totalShares: Number(data?.totalShares ?? 0),

        isCpmAndResultHidden: Boolean(data?.isCpmAndResultHidden),
        isPriceHidden: Boolean(data?.isPriceHidden),

        hiddenColumns: Array.isArray(data?.hiddenColumns)
            ? data.hiddenColumns
            : [],

        cpm:
            data?.cpm !== undefined && data?.cpm !== null
                ? Number(data.cpm)
                : null,

        canEdit: Boolean(canEditSource),
    };
};

const buildCampaignSavePayload = (editable: EditableCampaign) => {
    if (editable.kind === "regular") {
        return {
            isCpmAndResultHidden: editable.isCpmAndResultHidden,
            isPriceHidden: editable.isPriceHidden,
        };
    }

    return {
        campaignName: editable.campaignName,
        isCpmAndResultHidden: editable.isCpmAndResultHidden,
        isPriceHidden: editable.isPriceHidden,

        addedAccounts: editable.addedAccounts.map((account) => ({
            ...(account.addedAccountsId
                ? { addedAccountsId: account.addedAccountsId }
                : {}),

            socialAccountId: account.socialAccountId,
            influencerId: account.influencerId,
            socialMedia: account.socialMedia,
            username: account.username,

            selectedCampaignContentItem: account.selectedCampaignContentItem
                ? {
                    campaignContentItemId:
                    account.selectedCampaignContentItem.campaignContentItemId,
                    descriptionId:
                    account.selectedCampaignContentItem.descriptionId,
                }
                : null,

            dateRequest: account.dateRequest || "ASAP",
        })),

        campaignContent: editable.campaignContent.map((item) => ({
            _id: item._id,
            socialMedia: item.socialMedia,
            profileType: item.profileType || undefined,
            socialMediaGroup: item.socialMediaGroup,
            mainLink: item.mainLink,
            descriptions: item.descriptions.map((description) => ({
                _id: description._id,
                description: description.description,
            })),
            taggedUser: item.taggedUser,
            taggedLink: item.taggedLink,
            additionalBrief: item.additionalBrief,
        })),
    };
};

type CampaignStore = {
    original: EditableCampaign | null;
    editable: EditableCampaign | null;

    kind: CampaignKind | null;
    activeOptionIndex: number | null;
    existingOptions: number[];

    recentlyAddedAccountKeys: string[];
    deletingAccountKey: string | null;

    initCampaign: (
        payload: InitCampaignPayload,
        params?: InitCampaignParams,
    ) => void;

    resetCampaign: () => void;
    resetEditableToOriginal: () => void;

    setCampaignName: (value: string) => void;
    setIsCpmAndResultHidden: (value: boolean) => void;
    setIsPriceHidden: (value: boolean) => void;

    setAccountDateRequest: (accountKey: string, dateRequest: string) => void;
    setAccountSelectedContent: (
        accountKey: string,
        selected: SelectedCampaignContentItem | null,
    ) => void;

    addAccounts: (accounts: EditableCampaignAccount[]) => void;
    removeAccount: (accountKey: string) => void;

    markAccountAsAdded: (accountKey: string) => void;
    clearRecentlyAdded: (accountKey: string) => void;
    setDeletingAccountKey: (accountKey: string | null) => void;

    setContentField: (
        contentId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;

    setContentDescriptions: (
        contentId: string,
        descriptions: EditableDescription[],
    ) => void;

    addContentDescription: (contentId: string, text?: string) => string;
    updateContentDescription: (
        contentId: string,
        descriptionId: string,
        value: string,
    ) => void;
    removeContentDescription: (contentId: string, descriptionId: string) => void;

    addContentItem: (
        socialMedia: string,
        payload?: Partial<EditableCampaignContentItem>,
        inheritFromContentId?: string,
    ) => {
        contentId: string;
        firstDescriptionId: string;
    };
    mergeCampaignContent: (items: EditableCampaignContentItem[]) => void;
    removeContentItem: (contentId: string) => void;

    buildSavePayload: () => any | null;
};

export const useCampaignStore = create<CampaignStore>((set, get) => ({
    original: null,
    editable: null,

    kind: null,
    activeOptionIndex: null,
    existingOptions: [],

    recentlyAddedAccountKeys: [],
    deletingAccountKey: null,

    initCampaign: (payload, params) => {
        const normalized = normalizeCampaignForStore(payload, params);

        set({
            original: structuredClone(normalized),
            editable: structuredClone(normalized),

            kind: normalized.kind,
            activeOptionIndex: normalized.optionIndex,
            existingOptions: normalized.existingOptions,

            recentlyAddedAccountKeys: [],
            deletingAccountKey: null,
        });
    },

    resetCampaign: () =>
        set({
            original: null,
            editable: null,

            kind: null,
            activeOptionIndex: null,
            existingOptions: [],

            recentlyAddedAccountKeys: [],
            deletingAccountKey: null,
        }),
    mergeCampaignContent: (items) =>
        set((state) => {
            if (!state.editable) return state;

            const incomingItems = Array.isArray(items) ? items : [];
            if (!incomingItems.length) return state;

            const existingIds = new Set(
                state.editable.campaignContent.map((item) => String(item._id)),
            );

            const normalizedIncoming = incomingItems.map(normalizeContentItem);

            const nextContent = [
                ...state.editable.campaignContent,
                ...normalizedIncoming.filter(
                    (item) => !existingIds.has(String(item._id)),
                ),
            ];

            return {
                editable: {
                    ...state.editable,
                    campaignContent: nextContent,
                },
            };
        }),
    resetEditableToOriginal: () =>
        set((state) => {
            if (!state.original) return state;

            return {
                editable: structuredClone(state.original),
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

    setIsCpmAndResultHidden: (value) =>
        set((state) => {
            if (!state.editable) return state;

            return {
                editable: {
                    ...state.editable,
                    isCpmAndResultHidden: value,
                },
            };
        }),

    setIsPriceHidden: (value) =>
        set((state) => {
            if (!state.editable) return state;

            return {
                editable: {
                    ...state.editable,
                    isPriceHidden: value,
                },
            };
        }),

    setAccountDateRequest: (accountKey, dateRequest) =>
        set((state) => {
            if (!state.editable) return state;

            return {
                editable: {
                    ...state.editable,
                    addedAccounts: state.editable.addedAccounts.map((account) =>
                        getCampaignAccountKey(account) === String(accountKey)
                            ? { ...account, dateRequest }
                            : account,
                    ),
                },
            };
        }),

    setAccountSelectedContent: (accountKey, selected) =>
        set((state) => {
            if (!state.editable) return state;

            return {
                editable: {
                    ...state.editable,
                    addedAccounts: state.editable.addedAccounts.map((account) =>
                        getCampaignAccountKey(account) === String(accountKey)
                            ? {
                                ...account,
                                selectedCampaignContentItem: selected
                                    ? {
                                        campaignContentItemId: toStringSafe(
                                            selected.campaignContentItemId,
                                        ),
                                        descriptionId: toStringSafe(
                                            selected.descriptionId,
                                        ),
                                    }
                                    : null,
                                selectedContent: selected
                                    ? {
                                        campaignContentItemId: toStringSafe(
                                            selected.campaignContentItemId,
                                        ),
                                        descriptionId: toStringSafe(
                                            selected.descriptionId,
                                        ),
                                    }
                                    : null,
                            }
                            : account,
                    ),
                },
            };
        }),

    addAccounts: (accounts) =>
        set((state) => {
            if (!state.editable) return state;

            const incomingAccounts = accounts ?? [];
            if (!incomingAccounts.length) return state;

            const allContent = state.editable.campaignContent;

            const nextPrepared = incomingAccounts.map((account) => {
                const sm = String(account.socialMedia ?? "").toLowerCase();
                const group = getGroupBySocial(sm);

                const defaultItem =
                    allContent.find(
                        (item) =>
                            String(item.socialMedia ?? "").toLowerCase() === sm,
                    ) ??
                    allContent.find(
                        (item) => String(item.socialMediaGroup ?? "") === group,
                    ) ??
                    null;

                const defaultSelected =
                    defaultItem?._id && defaultItem?.descriptions?.[0]?._id
                        ? {
                            campaignContentItemId: String(defaultItem._id),
                            descriptionId: String(defaultItem.descriptions[0]._id),
                        }
                        : null;

                const incomingSelected =
                    account.selectedCampaignContentItem ??
                    account.selectedContent ??
                    null;

                return {
                    ...account,

                    addedAccountsId: undefined,
                    __clientId: objectId(),

                    socialAccountId: toStringSafe(
                        account.socialAccountId,
                    ),
                    influencerId: toStringSafe(account.influencerId),
                    socialMedia: sm,
                    username: toStringSafe(account.username),

                    publicPrice: Number(account.publicPrice ?? 0),
                    followers: Number(account.followers ?? 0),
                    logoUrl: toStringSafe(account.logoUrl ?? ""),
                    genres: Array.isArray(account.genres) ? account.genres : [],
                    countries: Array.isArray(account.countries)
                        ? account.countries
                        : [],
                    profileType: account.profileType
                        ? toStringSafe(account.profileType)
                        : undefined,

                    selectedCampaignContentItem: incomingSelected ?? defaultSelected,
                    selectedContent: incomingSelected ?? defaultSelected,

                    dateRequest: account.dateRequest ?? "ASAP",
                };
            });

            const nextAccounts = [...state.editable.addedAccounts, ...nextPrepared];

            return {
                editable: {
                    ...state.editable,
                    addedAccounts: nextAccounts,
                    price: getAutoPriceFromAccounts(nextAccounts),
                },
                recentlyAddedAccountKeys: [
                    ...state.recentlyAddedAccountKeys,
                    ...nextPrepared.map(getCampaignAccountKey),
                ],
            };
        }),

    removeAccount: (accountKey) =>
        set((state) => {
            if (!state.editable) return state;

            const prevAccounts = state.editable.addedAccounts;

            const removed = prevAccounts.find(
                (account) => getCampaignAccountKey(account) === String(accountKey),
            );

            if (!removed) return state;

            const nextAccounts = prevAccounts.filter(
                (account) => getCampaignAccountKey(account) !== String(accountKey),
            );

            const removedGroup = getGroupBySocial(removed.socialMedia);

            const stillHasGroup = nextAccounts.some(
                (account) => getGroupBySocial(account.socialMedia) === removedGroup,
            );

            let nextContent = state.editable.campaignContent;

            if (!stillHasGroup) {
                nextContent = nextContent.filter(
                    (item) => item.socialMediaGroup !== removedGroup,
                );
            }

            return {
                editable: {
                    ...state.editable,
                    addedAccounts: nextAccounts,
                    campaignContent: nextContent,
                    price: getAutoPriceFromAccounts(nextAccounts),
                },
                deletingAccountKey: null,
                recentlyAddedAccountKeys: state.recentlyAddedAccountKeys.filter(
                    (key) => key !== String(accountKey),
                ),
            };
        }),

    markAccountAsAdded: (accountKey) =>
        set((state) => ({
            recentlyAddedAccountKeys: [
                ...state.recentlyAddedAccountKeys,
                String(accountKey),
            ],
        })),

    clearRecentlyAdded: (accountKey) =>
        set((state) => ({
            recentlyAddedAccountKeys: state.recentlyAddedAccountKeys.filter(
                (key) => key !== String(accountKey),
            ),
        })),

    setDeletingAccountKey: (accountKey) => set({ deletingAccountKey: accountKey }),

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
                            ? { ...item, descriptions }
                            : item,
                    ),
                },
            };
        }),

    addContentDescription: (contentId, text = "") => {
        const newDescriptionId = objectId();

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
                                        _id: newDescriptionId,
                                        description: text,
                                    },
                                ],
                            }
                            : item,
                    ),
                },
            };
        });

        return newDescriptionId;
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
                                descriptions: item.descriptions.map(
                                    (description) =>
                                        String(description._id) ===
                                        String(descriptionId)
                                            ? {
                                                ...description,
                                                description: value,
                                            }
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
                                        String(description._id) !==
                                        String(descriptionId),
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

        const sm = toStringSafe(socialMedia).toLowerCase();
        const group = getGroupBySocial(sm);

        const base =
            editable.campaignContent.find(
                (item) => String(item._id) === String(inheritFromContentId),
            ) ??
            editable.campaignContent.find(
                (item) => String(item.socialMedia ?? "").toLowerCase() === sm,
            ) ??
            editable.campaignContent.find(
                (item) => String(item.socialMediaGroup ?? "") === group,
            ) ??
            null;

        const newId = objectId();

        const descriptions =
            payload?.descriptions?.map((description) => ({
                _id: toStringSafe(description?._id || objectId()),
                description: toStringSafe(description?.description),
            })) ??
            (base?.descriptions ?? []).map((description) => ({
                _id: objectId(),
                description: toStringSafe(description?.description),
            }));

        if (!descriptions.length) {
            descriptions.push({
                _id: objectId(),
                description: "",
            });
        }

        const firstDescriptionId = String(descriptions?.[0]?._id ?? "");

        const nextItem: EditableCampaignContentItem = {
            _id: newId,
            socialMedia: sm,
            profileType: payload?.profileType
                ? toStringSafe(payload.profileType)
                : base?.profileType,
            socialMediaGroup: group,
            mainLink: toStringSafe(payload?.mainLink ?? base?.mainLink),
            mediaCache: payload?.mediaCache ?? base?.mediaCache ?? undefined,
            taggedUser: toStringSafe(payload?.taggedUser ?? base?.taggedUser),
            taggedLink: toStringSafe(payload?.taggedLink ?? base?.taggedLink),
            additionalBrief: toStringSafe(
                payload?.additionalBrief ?? base?.additionalBrief,
            ),
            descriptions,
        };

        set((current) => {
            if (!current.editable) return current;

            return {
                editable: {
                    ...current.editable,
                    campaignContent: [
                        ...current.editable.campaignContent,
                        nextItem,
                    ],
                },
            };
        });

        return {
            contentId: newId,
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
                if (
                    account.selectedCampaignContentItem?.campaignContentItemId ===
                    String(contentId)
                ) {
                    const sm = String(account.socialMedia ?? "").toLowerCase();
                    const group = getGroupBySocial(sm);

                    const fallback =
                        nextContent.find(
                            (item) =>
                                String(item.socialMedia ?? "").toLowerCase() === sm,
                        ) ??
                        nextContent.find(
                            (item) => String(item.socialMediaGroup ?? "") === group,
                        ) ??
                        null;

                    const selected =
                        fallback?._id && fallback?.descriptions?.[0]?._id
                            ? {
                                campaignContentItemId: String(fallback._id),
                                descriptionId: String(
                                    fallback.descriptions[0]._id,
                                ),
                            }
                            : null;

                    return {
                        ...account,
                        selectedCampaignContentItem: selected,
                        selectedContent: selected,
                    };
                }

                return account;
            });

            return {
                editable: {
                    ...state.editable,
                    campaignContent: nextContent,
                    addedAccounts: nextAccounts,
                },
            };
        }),

    buildSavePayload: () => {
        const state = get();

        if (!state.editable) return null;

        return buildCampaignSavePayload(state.editable);
    },
}));