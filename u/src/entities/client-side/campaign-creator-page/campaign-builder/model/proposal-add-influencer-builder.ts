import type {
    ProposalAddedAccountDto,
    ProposalOptionDto,
    ProposalSelectedOfferInput,
} from "@/entities/client-side/campaign/model/campaign-api.types";
import type {
    HydratedCampaignBuilderDraftState,
    SelectedCampaignAccount,
} from "./campaign-builder.types";
import type { Bundle } from "@/entities/client-side/campaign-creator-page/bundle";
import type { PublishedOffer } from "@/entities/client-side/campaign-creator-page/offer/model/offer.types";
import type { PromoAccount } from "@/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.types";
import {
    isCampaignSelectionPricingAvailable,
    mapOfferAccountToSelectedAccount,
    normalizeSelectedAccounts,
} from "./campaign-builder-selection";
import { calcBuilderTotal } from "./calc-builder-total";
import {
    CAMPAIGN_CURRENCY_OPTIONS,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/build-campaign-params.constants";
import { normalizeAdditionalBriefVersions } from "@/entities/client-side/campaign/model/campaign-content";

type WorkingProposalAccount = ProposalAddedAccountDto &
    Record<string, unknown>;

type BundleMembership = Record<string, string[]>;

export type ProposalAddInfluencerSource = {
    campaignName: string;
    snapshot: ProposalOptionDto;
    accounts: readonly WorkingProposalAccount[];
    content: readonly Record<string, any>[];
    pendingBundleMembership?: Readonly<Record<string, readonly string[]>>;
    selectedOfferChange?: ProposalSelectedOfferInput | null;
    cachedBuilderState?: HydratedCampaignBuilderDraftState;
};

export type ProposalAddInfluencerHydrationOptions = {
    bundlesById?: ReadonlyMap<string, Bundle>;
    offer?: PublishedOffer;
    standaloneAccountsById?: ReadonlyMap<string, PromoAccount>;
};

export type ProposalAddInfluencerRequirements = {
    bundleIds: string[];
    offer: {
        offerId: string;
        socialMedia?: string;
        genre?: string;
    } | null;
    standaloneAccounts: Array<{
        accountId: string;
        username: string;
        socialMedia: string;
    }>;
};

export class ProposalAddInfluencerHydrationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ProposalAddInfluencerHydrationError";
    }
}

const fail = (message: string): never => {
    throw new ProposalAddInfluencerHydrationError(message);
};

const getSocialAccountId = (account: Record<string, unknown>): string =>
    String(account.socialAccountId ?? account.accountId ?? "").trim();

const sameStringSet = (
    left: readonly string[],
    right: readonly string[],
): boolean => {
    const leftSet = new Set(left.map(String));
    const rightSet = new Set(right.map(String));

    return leftSet.size === rightSet.size &&
        [...leftSet].every((value) => rightSet.has(value));
};

const getEffectiveBundleMembership = ({
    snapshot,
    accounts,
    pendingBundleMembership,
}: Pick<
    ProposalAddInfluencerSource,
    "snapshot" | "accounts" | "pendingBundleMembership"
>): BundleMembership => {
    if (pendingBundleMembership !== undefined) {
        return Object.fromEntries(
            Object.entries(pendingBundleMembership).map(([bundleId, ids]) => [
                bundleId,
                [...new Set(ids.map(String))],
            ]),
        );
    }

    return Object.fromEntries(
        snapshot.addedBundles.map((bundle) => [
            bundle.bundleId,
            accounts
                .filter(
                    (account) =>
                        String(account.bundleId ?? "") === bundle.bundleId,
                )
                .map(getSocialAccountId)
                .filter(Boolean),
        ]),
    );
};

const getEffectiveOffer = ({
    snapshot,
    selectedOfferChange,
}: Pick<
    ProposalAddInfluencerSource,
    "snapshot" | "selectedOfferChange"
>): ProposalSelectedOfferInput | null => {
    if (selectedOfferChange !== undefined) return selectedOfferChange;
    if (!snapshot.selectedOffer) return null;

    return {
        offerId: snapshot.selectedOffer.offerId,
        selectedAccountIds: [...snapshot.selectedOffer.selectedAccountIds],
        selectedAddedAccountsIds: [
            ...snapshot.selectedOffer.selectedAddedAccountsIds,
        ],
    };
};

export const getProposalAddInfluencerRequirements = (
    source: ProposalAddInfluencerSource,
): ProposalAddInfluencerRequirements => {
    const bundleMembership = getEffectiveBundleMembership(source);
    const effectiveOffer = getEffectiveOffer(source);
    const packageAccountIds = new Set([
        ...Object.values(bundleMembership).flat(),
        ...(effectiveOffer?.selectedAccountIds ?? []),
    ]);
    const persistedOffer = source.snapshot.selectedOffer;

    return {
        bundleIds: Object.entries(bundleMembership)
            .filter(([, accountIds]) => accountIds.length > 0)
            .map(([bundleId]) => bundleId),
        offer: effectiveOffer
            ? {
                offerId: effectiveOffer.offerId,
                ...(persistedOffer?.offerId === effectiveOffer.offerId
                    ? {
                        socialMedia: String(persistedOffer.socialMedia),
                        genre: String(persistedOffer.genre),
                    }
                    : {}),
            }
            : null,
        standaloneAccounts: source.accounts
            .map((account) => ({
                accountId: getSocialAccountId(account),
                username: String(account.username ?? ""),
                socialMedia: String(account.socialMedia ?? "").toLowerCase(),
            }))
            .filter(
                (account) =>
                    Boolean(account.accountId) &&
                    !packageAccountIds.has(account.accountId),
            ),
    };
};

export const mapPromoAccountToSelectedAccount = (
    account: PromoAccount,
): SelectedCampaignAccount => ({
    accountId: account.accountId,
    influencerId: account.influencerId,
    socialMedia: account.socialMedia,
    username: account.username,
    logoUrl: account.logoUrl,
    followers: account.followers,
    prices: { ...account.prices },
    profileType: account.profileType,
    countries: account.countries.map((country) => ({ ...country })),
    genres: [...account.musicGenres],
    source: "manual",
    dateRequest: "ASAP",
});

const mapWorkingAccount = ({
    account,
    currency,
    metadata,
}: {
    account: WorkingProposalAccount;
    currency: ProposalOptionDto["displayCurrency"];
    metadata?: SelectedCampaignAccount;
}): SelectedCampaignAccount => {
    const accountId = getSocialAccountId(account);
    if (!accountId) fail("Proposal account identity is unavailable.");

    const selectedCampaignContentItem =
        (account.selectedCampaignContentItem ?? account.selectedContent) as
            SelectedCampaignAccount["selectedCampaignContentItem"];
    const currentPrice = Number(
        account.publicPrice ?? account.price ?? metadata?.prices?.[currency],
    );
    const prices = metadata?.prices
        ? { ...metadata.prices }
        : {
            ...((account.prices as SelectedCampaignAccount["prices"]) ?? {}),
            ...(Number.isFinite(currentPrice)
                ? { [currency]: currentPrice }
                : {}),
        };

    return {
        ...metadata,
        accountId,
        influencerId: String(account.influencerId ?? metadata?.influencerId ?? ""),
        socialMedia: String(account.socialMedia ?? metadata?.socialMedia ?? "")
            .toLowerCase(),
        username: String(account.username ?? metadata?.username ?? ""),
        logoUrl: String(account.logoUrl ?? metadata?.logoUrl ?? "") || undefined,
        followers: Number(account.followers ?? metadata?.followers ?? 0),
        prices,
        price: prices?.[currency],
        profileType:
            account.profileType === "creator" || account.profileType === "community"
                ? account.profileType
                : metadata?.profileType,
        countries: Array.isArray(account.countries)
            ? account.countries as SelectedCampaignAccount["countries"]
            : metadata?.countries,
        genres: Array.isArray(account.genres)
            ? account.genres.map(String)
            : metadata?.genres,
        dateRequest: String(account.dateRequest ?? metadata?.dateRequest ?? "ASAP"),
        selectedCampaignContentItem:
            selectedCampaignContentItem ??
            metadata?.selectedCampaignContentItem ??
            null,
    };
};

const mapCampaignContent = (
    content: readonly Record<string, any>[],
): HydratedCampaignBuilderDraftState["campaignContent"] =>
    content.map((item) => ({
        _id: String(item._id ?? ""),
        socialMedia: String(item.socialMedia ?? "").toLowerCase(),
        socialMediaGroup: item.socialMediaGroup,
        mainLink: String(item.mainLink ?? ""),
        descriptions: Array.isArray(item.descriptions)
            ? item.descriptions.map((description: any) => ({
                _id: String(description?._id ?? ""),
                description: String(description?.description ?? ""),
            }))
            : [],
        taggedUser: String(item.taggedUser ?? ""),
        taggedLink: String(item.taggedLink ?? ""),
        additionalBrief: normalizeAdditionalBriefVersions(item.additionalBrief),
        ...(item.profileType === "creator" || item.profileType === "community"
            ? { profileType: item.profileType }
            : {}),
    }));

export const prepareProposalAddInfluencerBuilderState = (
    source: ProposalAddInfluencerSource,
    options: ProposalAddInfluencerHydrationOptions = {},
): HydratedCampaignBuilderDraftState => {
    const currency = source.snapshot.displayCurrency;
    const currencyOption = CAMPAIGN_CURRENCY_OPTIONS.find(
        (option) => option.currency === currency,
    );
    if (!currencyOption) fail("Proposal currency is unavailable in Campaign Builder.");

    const accountIds = source.accounts.map(getSocialAccountId);
    if (
        accountIds.some((accountId) => !accountId) ||
        new Set(accountIds).size !== accountIds.length
    ) {
        fail("Proposal account topology cannot be normalized safely.");
    }

    const accountIdSet = new Set(accountIds);
    const bundleMembership = getEffectiveBundleMembership(source);
    const cachedBundlesById = new Map(
        (source.cachedBuilderState?.selectedBundles ?? []).map((bundle) => [
            bundle.bundleId,
            bundle,
        ] as const),
    );
    const selectedBundles = Object.entries(bundleMembership)
        .filter(([, selectedAccountIds]) => selectedAccountIds.length > 0)
        .map(([bundleId, selectedAccountIds]) => {
            if (selectedAccountIds.some((accountId) => !accountIdSet.has(accountId))) {
                fail("Proposal Bundle membership references an unavailable account.");
            }

            const bundle = options.bundlesById?.get(bundleId) ??
                cachedBundlesById.get(bundleId);
            if (!bundle) fail(`Bundle ${bundleId} is unavailable for editing.`);
            if (
                !sameStringSet(
                    bundle.accounts.map((account) => account.accountId),
                    selectedAccountIds,
                )
            ) {
                fail(`Bundle ${bundleId} membership no longer matches the Proposal.`);
            }

            return bundle;
        });

    const effectiveOffer = getEffectiveOffer(source);
    const selectedOfferAccountIds = effectiveOffer?.selectedAccountIds.map(String) ?? [];
    if (selectedOfferAccountIds.some((accountId) => !accountIdSet.has(accountId))) {
        fail("Proposal Offer membership references an unavailable account.");
    }

    const cachedOfferMatches =
        Boolean(effectiveOffer) &&
        source.cachedBuilderState?.selectedOfferId === effectiveOffer?.offerId &&
        sameStringSet(
            source.cachedBuilderState?.selectedOfferAccountIds ?? [],
            selectedOfferAccountIds,
        );
    const offerMetadata =
        options.offer?.id === effectiveOffer?.offerId
            ? options.offer
            : undefined;

    if (
        effectiveOffer &&
        offerMetadata &&
        !sameStringSet(
            offerMetadata.connectedAccounts.map((account) => account.accountId),
            selectedOfferAccountIds,
        )
    ) {
        fail("Offer membership no longer matches the Proposal.");
    }
    if (effectiveOffer && !offerMetadata && !cachedOfferMatches) {
        fail(`Offer ${effectiveOffer.offerId} is unavailable for editing.`);
    }

    const offerAccounts = offerMetadata
        ? offerMetadata.connectedAccounts.map(mapOfferAccountToSelectedAccount)
        : (source.cachedBuilderState?.selectedAccounts ?? []).filter(
            (account) => selectedOfferAccountIds.includes(account.accountId),
        );
    const offerAccountsById = new Map(
        offerAccounts.map((account) => [account.accountId, account] as const),
    );
    if (
        selectedOfferAccountIds.some(
            (accountId) => !offerAccountsById.has(accountId),
        )
    ) {
        fail("Offer account metadata is incomplete.");
    }

    const packageAccountIds = new Set([
        ...Object.values(bundleMembership).flat(),
        ...selectedOfferAccountIds,
    ]);
    const cachedAccountsById = new Map(
        (source.cachedBuilderState?.selectedAccounts ?? []).map((account) => [
            account.accountId,
            account,
        ] as const),
    );
    const currentAccounts = source.accounts.map((account) => {
        const accountId = getSocialAccountId(account);
        const promoMetadata = options.standaloneAccountsById?.get(accountId);
        const standaloneMetadata = promoMetadata
            ? mapPromoAccountToSelectedAccount(promoMetadata)
            : cachedAccountsById.get(accountId);
        const metadata = packageAccountIds.has(accountId)
            ? offerAccountsById.get(accountId) ?? cachedAccountsById.get(accountId)
            : standaloneMetadata;

        if (!packageAccountIds.has(accountId) && !metadata?.prices) {
            fail(`Account ${accountId} pricing is unavailable for editing.`);
        }

        return mapWorkingAccount({ account, currency, metadata });
    });
    const selectedPromoCardIds = accountIds.filter(
        (accountId) => !packageAccountIds.has(accountId),
    );
    const normalizedAccounts = normalizeSelectedAccounts({
        currentAccounts,
        selectedPromoCardIds,
        selectedOfferAccountIds,
        offerAccounts,
        selectedBundles,
    });
    if (normalizedAccounts.length !== accountIds.length) {
        fail("Proposal topology cannot be represented in Campaign Builder.");
    }

    const selectedOfferPrices = effectiveOffer
        ? offerMetadata?.prices ??
            (cachedOfferMatches
                ? source.cachedBuilderState?.selectedOfferPrices
                : undefined) ??
            {
                [currency]: source.snapshot.selectedOffer?.clientPrice,
            }
        : {};
    const selectedOfferPrice = effectiveOffer
        ? selectedOfferPrices[currency]
        : undefined;
    if (
        !isCampaignSelectionPricingAvailable({
            selectedOfferId: effectiveOffer?.offerId ?? null,
            selectedOfferPrice,
            selectedAccounts: normalizedAccounts,
            selectedBundles,
            selectedOfferAccountIds,
            currency,
        })
    ) {
        fail("Proposal pricing is unavailable in Campaign Builder.");
    }

    const totalPrice = calcBuilderTotal({
        selectedOfferId: effectiveOffer?.offerId ?? null,
        selectedOfferPrice,
        selectedAccounts: normalizedAccounts,
        selectedBundles,
        selectedOfferAccountIds,
        currency,
    });

    return {
        campaignName: source.campaignName,
        draftId: null,
        draftStep: null,
        selectedOfferId: effectiveOffer?.offerId ?? null,
        selectedOfferName:
            offerMetadata?.title ??
            (cachedOfferMatches
                ? source.cachedBuilderState?.selectedOfferName
                : undefined) ??
            source.snapshot.selectedOffer?.title ??
            "",
        selectedOfferPrice,
        selectedOfferPrices: { ...selectedOfferPrices },
        selectionCurrency: currency,
        selectedPromoCardIds,
        selectedOfferAccountIds,
        selectedAccounts: normalizedAccounts,
        selectedOfferAccounts: offerAccounts,
        selectedBundles: selectedBundles.map((bundle) => ({
            ...bundle,
            prices: { ...bundle.prices },
            originalPrices: { ...bundle.originalPrices },
            accounts: bundle.accounts.map((account) => ({
                ...account,
                prices: { ...account.prices },
                countries: account.countries.map((country) => ({ ...country })),
            })),
        })),
        draftSelectionRows: [],
        campaignContent: mapCampaignContent(source.content),
        totalPrice,
        selectedCurrency: currencyOption.key,
    };
};

export const snapshotCampaignBuilderWorkingState = (
    state: HydratedCampaignBuilderDraftState,
): HydratedCampaignBuilderDraftState => ({
    ...state,
    selectedOfferPrices: { ...state.selectedOfferPrices },
    selectedPromoCardIds: [...state.selectedPromoCardIds],
    selectedOfferAccountIds: [...state.selectedOfferAccountIds],
    selectedAccounts: state.selectedAccounts.map((account) => ({
        ...account,
        prices: account.prices ? { ...account.prices } : undefined,
    })),
    selectedOfferAccounts: state.selectedOfferAccounts.map((account) => ({
        ...account,
        prices: account.prices ? { ...account.prices } : undefined,
    })),
    selectedBundles: state.selectedBundles.map((bundle) => ({
        ...bundle,
        prices: { ...bundle.prices },
        originalPrices: { ...bundle.originalPrices },
        accounts: bundle.accounts.map((account) => ({
            ...account,
            prices: { ...account.prices },
            countries: account.countries.map((country) => ({ ...country })),
        })),
    })),
    draftSelectionRows: [...state.draftSelectionRows],
    campaignContent: state.campaignContent.map((item) => ({
        ...item,
        additionalBrief: item.additionalBrief.map((brief) => ({ ...brief })),
        descriptions: item.descriptions.map((description) => ({
            ...description,
        })),
    })),
});

export const reconcileProposalAccountsFromBuilder = ({
    builderAccounts,
    currentAccounts,
}: {
    builderAccounts: readonly SelectedCampaignAccount[];
    currentAccounts: readonly WorkingProposalAccount[];
}): WorkingProposalAccount[] => {
    const currentBySocialId = new Map(
        currentAccounts.map((account) => [
            getSocialAccountId(account),
            account,
        ] as const),
    );

    return builderAccounts.map((builderAccount) => {
        const current = currentBySocialId.get(builderAccount.accountId);
        const price = Number(
            current?.price ??
            current?.publicPrice ??
            builderAccount.price ??
            0,
        );
        const publicPrice = Number(
            current?.publicPrice ??
            current?.price ??
            builderAccount.price ??
            0,
        );
        const next: WorkingProposalAccount = {
            ...(current ?? {}),
            accountId: builderAccount.accountId,
            socialAccountId: builderAccount.accountId,
            influencerId: builderAccount.influencerId,
            socialMedia: builderAccount.socialMedia.toLowerCase(),
            username: builderAccount.username,
            followers: Number(builderAccount.followers ?? current?.followers ?? 0),
            logoUrl: builderAccount.logoUrl ?? current?.logoUrl ?? "",
            profileType: builderAccount.profileType ?? current?.profileType,
            countries: builderAccount.countries ?? current?.countries ?? [],
            genres: builderAccount.genres ?? current?.genres ?? [],
            prices: builderAccount.prices,
            price,
            publicPrice,
            dateRequest: builderAccount.dateRequest ?? current?.dateRequest ?? "ASAP",
            selectedContent:
                builderAccount.selectedCampaignContentItem ??
                current?.selectedContent ??
                current?.selectedCampaignContentItem ??
                null,
            selectedCampaignContentItem:
                builderAccount.selectedCampaignContentItem ??
                current?.selectedCampaignContentItem ??
                current?.selectedContent ??
                null,
            source: builderAccount.source,
        } as WorkingProposalAccount;

        if (builderAccount.bundleId) {
            next.bundleId = builderAccount.bundleId;
            if (String(current?.bundleId ?? "") !== builderAccount.bundleId) {
                delete next.campaignBundleId;
                delete next.bundlePosition;
            }
        } else {
            delete next.bundleId;
            delete next.campaignBundleId;
            delete next.bundlePosition;
        }

        return next;
    });
};
