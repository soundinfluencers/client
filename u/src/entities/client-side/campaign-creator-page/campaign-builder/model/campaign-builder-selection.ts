import type {
    Bundle,
    BundleAccount,
} from "@/entities/client-side/campaign-creator-page/bundle";
import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";
import type {
    OfferConnectedAccount,
} from "@/entities/client-side/campaign-creator-page/offer/model/offer.types";
import type {
    CampaignBuilderState,
    SelectedBundleSnapshot,
    SelectedCampaignAccount,
} from "./campaign-builder.types";

export type BundleSelectionBlockReason =
    | "already-selected"
    | "bundle-overlap"
    | "missing-bundle-price"
    | "missing-overlap-account-price";

type CampaignSelectionState = Pick<
    CampaignBuilderState,
    | "selectedOfferId"
    | "selectedOfferName"
    | "selectedOfferPrice"
    | "selectedOfferPrices"
    | "selectionCurrency"
    | "selectedOfferAccountIds"
    | "selectedPromoCardIds"
    | "selectedAccounts"
    | "selectedBundles"
>;

type CampaignSelectionPatch = Partial<CampaignSelectionState>;

export type BundleSelectionCandidate = Pick<
    Bundle,
    "bundleId" | "prices"
> & {
    accounts: readonly Pick<
        BundleAccount,
        "accountId" | "prices"
    >[];
};

type SelectOfferPayload = {
    offerId: string | null;
    accountIds?: string[];
    accounts?: SelectedCampaignAccount[];
    offerName?: string;
    offerPrice?: number;
    offerPrices?: Partial<Record<CampaignCurrencyCode, number>>;
    currency: CampaignCurrencyCode;
};

const isProfileType = (
    profileType: string,
): profileType is "creator" | "community" =>
    profileType === "creator" || profileType === "community";

const getOfferAccountGenres = (
    account: OfferConnectedAccount,
): string[] =>
    account.profileType === "community"
        ? [...new Set(account.communityMusicGenres)]
        : [...new Set(account.creatorMusicGenres)];

export const mapOfferAccountToSelectedAccount = (
    account: OfferConnectedAccount,
): SelectedCampaignAccount => ({
    accountId: account.accountId,
    influencerId: account.influencerId,
    socialMedia: account.socialMedia,
    username: account.username,
    logoUrl: account.logoUrl || undefined,
    profileType: account.profileType,
    followers: account.followers,
    genres: getOfferAccountGenres(account),
    countries: account.countries.map((country) => ({ ...country })),
    dateRequest: "ASAP",
});

const getBundleAccountGenres = (
    account: BundleAccount,
): string[] => {
    if (account.profileType === "community") {
        return [
            ...new Set([
                ...account.communityMusicGenres,
                ...account.communityThemeTopics,
            ]),
        ];
    }

    if (account.profileType === "creator") {
        return [
            ...new Set([
                ...account.creatorMusicGenres,
                ...account.creatorContentFocus,
            ]),
        ];
    }

    return [];
};

const mapBundleAccountToSelectedAccount = (
    account: BundleAccount,
): SelectedCampaignAccount => ({
    accountId: account.accountId,
    influencerId: account.influencerId,
    socialMedia: account.socialMedia,
    username: account.username,
    logoUrl: account.logoUrl || undefined,
    followers: account.followers,
    profileType: isProfileType(account.profileType)
        ? account.profileType
        : undefined,
    genres: getBundleAccountGenres(account),
    countries: account.countries.map((country) => ({ ...country })),
    dateRequest: "ASAP",
});

const applyBundlePresentationMetadata = (
    account: SelectedCampaignAccount,
    bundleAccount?: BundleAccount,
): SelectedCampaignAccount => {
    if (!bundleAccount) return account;

    return {
        ...account,
        profileType:
            account.profileType ??
            (isProfileType(bundleAccount.profileType)
                ? bundleAccount.profileType
                : undefined),
        genres:
            account.genres !== undefined
                ? account.genres
                : getBundleAccountGenres(bundleAccount),
        countries:
            account.countries !== undefined
                ? account.countries
                : bundleAccount.countries.map((country) => ({ ...country })),
    };
};

const applyWorkflowState = (
    account: SelectedCampaignAccount,
    previousAccount?: SelectedCampaignAccount,
): SelectedCampaignAccount => {
    if (!previousAccount) return account;

    const nextAccount = { ...account };

    if (previousAccount.selectedCampaignContentItem !== undefined) {
        nextAccount.selectedCampaignContentItem =
            previousAccount.selectedCampaignContentItem;
    }

    if (previousAccount.dateRequest !== undefined) {
        nextAccount.dateRequest = previousAccount.dateRequest;
    }

    return nextAccount;
};

const toNonBillableAccount = (
    account: SelectedCampaignAccount,
    source: "offer" | "bundle",
    bundleId?: string,
): SelectedCampaignAccount => {
    const nextAccount = {
        ...account,
        source,
        bundleId,
    };

    delete nextAccount.price;

    if (!bundleId) {
        delete nextAccount.bundleId;
    }

    return nextAccount;
};

export const createSelectedBundleSnapshot = (
    bundle: Bundle,
): SelectedBundleSnapshot => ({
    ...bundle,
    prices: { ...bundle.prices },
    originalPrices: { ...bundle.originalPrices },
    accounts: bundle.accounts.map((account) => ({
        ...account,
        prices: { ...account.prices },
        countries: [...account.countries],
        communityMusicGenres: [...account.communityMusicGenres],
        communityThemeTopics: [...account.communityThemeTopics],
        creatorMusicGenres: [...account.creatorMusicGenres],
        creatorContentFocus: [...account.creatorContentFocus],
    })),
});

export const getSelectedBundleIds = (
    selectedBundles: readonly SelectedBundleSnapshot[],
): ReadonlySet<string> =>
    new Set(selectedBundles.map((bundle) => bundle.bundleId));

export const getSelectedBundleAccountIds = (
    selectedBundles: readonly SelectedBundleSnapshot[],
): ReadonlySet<string> =>
    new Set(
        selectedBundles.flatMap((bundle) =>
            bundle.accounts.map((account) => account.accountId),
        ),
    );

export const dedupeSelectedAccounts = (
    accounts: readonly SelectedCampaignAccount[],
): SelectedCampaignAccount[] =>
    Array.from(
        new Map(
            accounts.map((account) => [account.accountId, account]),
        ).values(),
    );

export const isAccountIncludedInSelectedBundle = (
    accountId: string,
    selectedBundles: readonly SelectedBundleSnapshot[],
): boolean => getSelectedBundleAccountIds(selectedBundles).has(accountId);

export const doesBundleOverlapSelectedBundles = (
    candidate: BundleSelectionCandidate,
    selectedBundles: readonly SelectedBundleSnapshot[],
): boolean => {
    const selectedAccountIds = getSelectedBundleAccountIds(
        selectedBundles.filter(
            (bundle) => bundle.bundleId !== candidate.bundleId,
        ),
    );

    return candidate.accounts.some((account) =>
        selectedAccountIds.has(account.accountId),
    );
};

export const getBundleSelectionBlockReason = ({
    bundle,
    selectedBundles,
    selectedOfferAccountIds,
    currency,
}: {
    bundle: BundleSelectionCandidate;
    selectedBundles: readonly SelectedBundleSnapshot[];
    selectedOfferAccountIds: readonly string[];
    currency: CampaignCurrencyCode;
}): BundleSelectionBlockReason | null => {
    if (
        selectedBundles.some(
            (selectedBundle) =>
                selectedBundle.bundleId === bundle.bundleId,
        )
    ) {
        return "already-selected";
    }

    if (doesBundleOverlapSelectedBundles(bundle, selectedBundles)) {
        return "bundle-overlap";
    }

    if (bundle.prices[currency] === undefined) {
        return "missing-bundle-price";
    }

    const selectedOfferAccountIdSet = new Set(selectedOfferAccountIds);
    const hasMissingOverlapPrice = bundle.accounts.some(
        (account) =>
            selectedOfferAccountIdSet.has(account.accountId) &&
            account.prices[currency] === undefined,
    );

    return hasMissingOverlapPrice
        ? "missing-overlap-account-price"
        : null;
};

export const isSelectedBundlePricingAvailable = ({
    selectedBundles,
    selectedOfferAccountIds,
    currency,
}: {
    selectedBundles: readonly SelectedBundleSnapshot[];
    selectedOfferAccountIds: readonly string[];
    currency: CampaignCurrencyCode;
}): boolean => {
    const selectedOfferAccountIdSet = new Set(selectedOfferAccountIds);

    return selectedBundles.every(
        (bundle) =>
            bundle.prices[currency] !== undefined &&
            bundle.accounts.every(
                (account) =>
                    !selectedOfferAccountIdSet.has(account.accountId) ||
                    account.prices[currency] !== undefined,
            ),
    );
};

export const normalizeSelectedAccounts = ({
    currentAccounts,
    selectedPromoCardIds,
    selectedOfferAccountIds,
    offerAccounts,
    selectedBundles,
}: {
    currentAccounts: readonly SelectedCampaignAccount[];
    selectedPromoCardIds: readonly string[];
    selectedOfferAccountIds: readonly string[];
    offerAccounts: readonly SelectedCampaignAccount[];
    selectedBundles: readonly SelectedBundleSnapshot[];
}): SelectedCampaignAccount[] => {
    const previousAccountsById = new Map(
        currentAccounts.map((account) => [account.accountId, account]),
    );
    const manualAccountIds = new Set(selectedPromoCardIds);
    const manualAccountsById = new Map(
        currentAccounts
            .filter(
                (account) =>
                    account.source === "manual" &&
                    manualAccountIds.has(account.accountId),
            )
            .map((account) => [account.accountId, account]),
    );
    const offerAccountIds = new Set(selectedOfferAccountIds);
    const offerAccountsById = new Map(
        offerAccounts.map((account) => [account.accountId, account]),
    );
    const bundleCoverageByAccountId = new Map<
        string,
        {
            bundleId: string;
            account: BundleAccount;
        }
    >();

    selectedBundles.forEach((bundle) => {
        bundle.accounts.forEach((account) => {
            if (!bundleCoverageByAccountId.has(account.accountId)) {
                bundleCoverageByAccountId.set(account.accountId, {
                    bundleId: bundle.bundleId,
                    account,
                });
            }
        });
    });

    const orderedAccountIds = new Set<string>();

    currentAccounts.forEach((account) =>
        orderedAccountIds.add(account.accountId),
    );
    selectedPromoCardIds.forEach((accountId) =>
        orderedAccountIds.add(accountId),
    );
    selectedBundles.forEach((bundle) =>
        bundle.accounts.forEach((account) =>
            orderedAccountIds.add(account.accountId),
        ),
    );
    selectedOfferAccountIds.forEach((accountId) =>
        orderedAccountIds.add(accountId),
    );

    const normalizedAccounts: SelectedCampaignAccount[] = [];

    orderedAccountIds.forEach((accountId) => {
        const previousAccount = previousAccountsById.get(accountId);
        const bundleCoverage =
            bundleCoverageByAccountId.get(accountId);

        if (offerAccountIds.has(accountId)) {
            const offerAccount =
                offerAccountsById.get(accountId) ?? previousAccount;

            if (!offerAccount) return;

            normalizedAccounts.push(
                applyWorkflowState(
                    toNonBillableAccount(
                        applyBundlePresentationMetadata(
                            offerAccount,
                            bundleCoverage?.account,
                        ),
                        "offer",
                        bundleCoverage?.bundleId,
                    ),
                    previousAccount,
                ),
            );
            return;
        }

        if (bundleCoverage) {
            normalizedAccounts.push(
                applyWorkflowState(
                    toNonBillableAccount(
                        mapBundleAccountToSelectedAccount(
                            bundleCoverage.account,
                        ),
                        "bundle",
                        bundleCoverage.bundleId,
                    ),
                    previousAccount,
                ),
            );
            return;
        }

        const manualAccount = manualAccountsById.get(accountId);

        if (manualAccount) {
            const nextManualAccount = {
                ...manualAccount,
                source: "manual" as const,
            };

            delete nextManualAccount.bundleId;
            normalizedAccounts.push(nextManualAccount);
        }
    });

    return normalizedAccounts;
};

export const selectBundleFromCampaignSelection = ({
    state,
    bundle,
    currency,
}: {
    state: CampaignSelectionState;
    bundle: Bundle;
    currency: CampaignCurrencyCode;
}): CampaignSelectionPatch | null => {
    if (
        state.selectionCurrency &&
        state.selectionCurrency !== currency
    ) {
        return null;
    }

    const blockReason = getBundleSelectionBlockReason({
        bundle,
        selectedBundles: state.selectedBundles,
        selectedOfferAccountIds: state.selectedOfferAccountIds,
        currency,
    });

    if (blockReason) return null;

    const nextSelectedBundles = [
        ...state.selectedBundles,
        createSelectedBundleSnapshot(bundle),
    ];
    const bundleAccountIds = new Set(
        bundle.accounts.map((account) => account.accountId),
    );
    const nextSelectedPromoCardIds =
        state.selectedPromoCardIds.filter(
            (accountId) => !bundleAccountIds.has(accountId),
        );
    const currentOfferAccounts = state.selectedAccounts.filter(
        (account) => account.source === "offer",
    );

    return {
        selectionCurrency: state.selectionCurrency ?? currency,
        selectedBundles: nextSelectedBundles,
        selectedPromoCardIds: nextSelectedPromoCardIds,
        selectedAccounts: normalizeSelectedAccounts({
            currentAccounts: state.selectedAccounts,
            selectedPromoCardIds: nextSelectedPromoCardIds,
            selectedOfferAccountIds: state.selectedOfferAccountIds,
            offerAccounts: currentOfferAccounts,
            selectedBundles: nextSelectedBundles,
        }),
    };
};

export const removeBundleFromCampaignSelection = ({
    state,
    bundleId,
}: {
    state: CampaignSelectionState;
    bundleId: string;
}): CampaignSelectionPatch | null => {
    const nextSelectedBundles = state.selectedBundles.filter(
        (bundle) => bundle.bundleId !== bundleId,
    );

    if (nextSelectedBundles.length === state.selectedBundles.length) {
        return null;
    }

    const currentOfferAccounts = state.selectedAccounts.filter(
        (account) => account.source === "offer",
    );

    return {
        selectionCurrency: state.selectionCurrency,
        selectedBundles: nextSelectedBundles,
        selectedAccounts: normalizeSelectedAccounts({
            currentAccounts: state.selectedAccounts,
            selectedPromoCardIds: state.selectedPromoCardIds,
            selectedOfferAccountIds: state.selectedOfferAccountIds,
            offerAccounts: currentOfferAccounts,
            selectedBundles: nextSelectedBundles,
        }),
    };
};

export const selectOfferFromCampaignSelection = ({
    state,
    payload,
}: {
    state: CampaignSelectionState;
    payload: SelectOfferPayload;
}): CampaignSelectionPatch => {
    const {
        offerId,
        offerName,
        offerPrice,
        offerPrices = {},
        currency,
        accountIds = [],
        accounts = [],
    } = payload;
    const isSameOffer = state.selectedOfferId === offerId;

    if (
        offerId &&
        state.selectionCurrency &&
        state.selectionCurrency !== currency
    ) {
        return {};
    }

    if (!offerId || isSameOffer) {
        return {
            selectionCurrency: state.selectionCurrency,
            selectedOfferId: null,
            selectedOfferName: "",
            selectedOfferPrice: undefined,
            selectedOfferPrices: {},
            selectedOfferAccountIds: [],
            selectedAccounts: normalizeSelectedAccounts({
                currentAccounts: state.selectedAccounts,
                selectedPromoCardIds: state.selectedPromoCardIds,
                selectedOfferAccountIds: [],
                offerAccounts: [],
                selectedBundles: state.selectedBundles,
            }),
        };
    }

    const offerAccountsById = new Map(
        accounts.map((account) => [account.accountId, account]),
    );
    const nextOfferAccountIds = Array.from(
        new Set([
            ...accountIds,
            ...offerAccountsById.keys(),
        ]),
    );
    const nextOfferAccountIdSet = new Set(nextOfferAccountIds);
    const nextSelectedPromoCardIds =
        state.selectedPromoCardIds.filter(
            (accountId) => !nextOfferAccountIdSet.has(accountId),
        );

    return {
        selectionCurrency: state.selectionCurrency ?? currency,
        selectedOfferId: offerId,
        selectedOfferName: offerName ?? "",
        selectedOfferPrice: offerPrice,
        selectedOfferPrices: { ...offerPrices },
        selectedOfferAccountIds: nextOfferAccountIds,
        selectedPromoCardIds: nextSelectedPromoCardIds,
        selectedAccounts: normalizeSelectedAccounts({
            currentAccounts: state.selectedAccounts,
            selectedPromoCardIds: nextSelectedPromoCardIds,
            selectedOfferAccountIds: nextOfferAccountIds,
            offerAccounts: accounts,
            selectedBundles: state.selectedBundles,
        }),
    };
};

export const getManualAccountsPrice = (
    selectedAccounts: readonly SelectedCampaignAccount[],
    currency: CampaignCurrencyCode,
): number =>
    selectedAccounts.reduce(
        (sum, account) => {
            const price = account.prices?.[currency];

            return account.source === "manual" &&
                typeof price === "number"
                ? sum + price
                : sum;
        },
        0,
    );

export const isCampaignSelectionPricingAvailable = ({
    selectedOfferId,
    selectedOfferPrice,
    selectedAccounts,
    selectedBundles,
    selectedOfferAccountIds,
    currency,
}: {
    selectedOfferId: string | null;
    selectedOfferPrice?: number;
    selectedAccounts: readonly SelectedCampaignAccount[];
    selectedBundles: readonly SelectedBundleSnapshot[];
    selectedOfferAccountIds: readonly string[];
    currency: CampaignCurrencyCode;
}): boolean =>
    (!selectedOfferId || typeof selectedOfferPrice === "number") &&
    selectedAccounts.every(
        (account) =>
            account.source !== "manual" ||
            typeof account.prices?.[currency] === "number",
    ) &&
    isSelectedBundlePricingAvailable({
        selectedBundles,
        selectedOfferAccountIds,
        currency,
    });

export const getSelectedBundlesPrice = (
    selectedBundles: readonly SelectedBundleSnapshot[],
    currency: CampaignCurrencyCode,
): number =>
    selectedBundles.reduce((sum, bundle) => {
        const price = bundle.prices[currency];

        return typeof price === "number" ? sum + price : sum;
    }, 0);

export const getOfferBundleOverlapDeduction = ({
    selectedBundles,
    selectedOfferAccountIds,
    currency,
}: {
    selectedBundles: readonly SelectedBundleSnapshot[];
    selectedOfferAccountIds: readonly string[];
    currency: CampaignCurrencyCode;
}): number => {
    const selectedOfferAccountIdSet = new Set(selectedOfferAccountIds);
    const deductedAccountIds = new Set<string>();

    return selectedBundles.reduce(
        (bundleSum, bundle) =>
            bundleSum +
            bundle.accounts.reduce((accountSum, account) => {
                if (
                    !selectedOfferAccountIdSet.has(account.accountId) ||
                    deductedAccountIds.has(account.accountId)
                ) {
                    return accountSum;
                }

                const accountPrice = account.prices[currency];

                if (typeof accountPrice !== "number") {
                    return accountSum;
                }

                deductedAccountIds.add(account.accountId);
                return accountSum + accountPrice;
            }, 0),
        0,
    );
};

export const calculateCampaignSelectionTotal = ({
    offerPrice,
    selectedAccounts,
    selectedBundles,
    selectedOfferAccountIds,
    currency,
}: {
    offerPrice: number;
    selectedAccounts: readonly SelectedCampaignAccount[];
    selectedBundles: readonly SelectedBundleSnapshot[];
    selectedOfferAccountIds: readonly string[];
    currency: CampaignCurrencyCode;
}): number =>
    offerPrice +
    getSelectedBundlesPrice(selectedBundles, currency) +
    getManualAccountsPrice(selectedAccounts, currency) -
    getOfferBundleOverlapDeduction({
        selectedBundles,
        selectedOfferAccountIds,
        currency,
    });
