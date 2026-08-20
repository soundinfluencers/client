import assert from "node:assert/strict";
import test from "node:test";

import type {
    ProposalOptionDto,
} from "../src/entities/client-side/campaign/model/campaign-api.types.ts";
import type {
    Bundle,
} from "../src/entities/client-side/campaign-creator-page/bundle/model/bundle.types.ts";
import type {
    PublishedOffer,
} from "../src/entities/client-side/campaign-creator-page/offer/model/offer.types.ts";
import type {
    PromoAccount,
} from "../src/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.types.ts";
import {
    getProposalAddInfluencerRequirements,
    prepareProposalAddInfluencerBuilderState,
    reconcileProposalAccountsFromBuilder,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-add-influencer-builder.ts";
import {
    selectBundleFromCampaignSelection,
    selectOfferFromCampaignSelection,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-selection.ts";
import {
    buildProposalAddInfluencerUrl,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation.ts";

const prices = { EUR: 100, USD: 110, GBP: 90 };

const bundle = (
    bundleId: string,
    accountIds: string[],
): Bundle => ({
    bundleId,
    influencerId: `influencer-${bundleId}`,
    prices: { EUR: 250, USD: 275, GBP: 225 },
    originalPrices: { EUR: 300, USD: 330, GBP: 270 },
    followers: accountIds.length * 1_000,
    createdAt: "2026-08-18T00:00:00.000Z",
    accounts: accountIds.map((accountId) => ({
        accountId,
        influencerId: `influencer-${accountId}`,
        username: accountId,
        logoUrl: "",
        followers: 1_000,
        prices: { ...prices },
        socialMedia: "instagram",
        profileType: "creator",
        countries: [],
        engagementRate: 0,
        averageViews: 0,
        communityMusicGenres: [],
        communityThemeTopics: [],
        creatorMusicGenres: [],
        creatorContentFocus: [],
    })),
});

const offer = (offerId: string, accountIds: string[]): PublishedOffer => ({
    id: offerId,
    title: `Offer ${offerId}`,
    price: 500,
    prices: { EUR: 500, USD: 550, GBP: 450 },
    storyAndPostDetails: "Details",
    networksAmount: accountIds.length,
    combinedFollowers: accountIds.length * 1_000,
    connectedAccounts: accountIds.map((accountId) => ({
        accountId,
        influencerId: `influencer-${accountId}`,
        socialMedia: "instagram",
        username: accountId,
        logoUrl: "",
        profileType: "creator",
        followers: 1_000,
        countries: [],
        communityMusicGenres: [],
        creatorMusicGenres: [],
    })),
});

const promo = (accountId: string): PromoAccount => ({
    accountId,
    influencerId: `influencer-${accountId}`,
    username: accountId,
    logoUrl: "",
    followers: 1_000,
    prices: { ...prices },
    socialMedia: "instagram",
    profileType: "creator",
    countries: [],
    averageViews: 0,
    engagementRate: 0,
    communityMusicGenres: [],
    communityThemeTopics: [],
    creatorMusicGenres: [],
    creatorContentFocus: [],
    musicGenres: [],
    bundlePreviews: [],
});

const account = (
    accountId: string,
    bundleId?: string,
) => ({
    addedAccountsId: `added-${accountId}`,
    socialAccountId: accountId,
    influencerId: `influencer-${accountId}`,
    socialMedia: "instagram",
    username: accountId,
    publicPrice: 100,
    followers: 1_000,
    dateRequest: "ASAP",
    selectedContent: {
        campaignContentItemId: "content-main",
        descriptionId: "description-main",
    },
    ...(bundleId
        ? {
            bundleId,
            campaignBundleId: `campaign-${bundleId}`,
        }
        : {}),
});

const content = [{
    _id: "content-main",
    socialMedia: "instagram",
    socialMediaGroup: "main" as const,
    profileType: "creator" as const,
    mainLink: "https://example.com",
    descriptions: [{
        _id: "description-main",
        description: "Brief",
    }],
    taggedUser: "",
    taggedLink: "",
    additionalBrief: [],
}];

const snapshot = ({
    accounts,
    bundles = [],
    selectedOffer = null,
}: {
    accounts: ReturnType<typeof account>[];
    bundles?: Bundle[];
    selectedOffer?: PublishedOffer | null;
}): ProposalOptionDto => ({
    optionIndex: 1,
    price: 500,
    displayCurrency: "EUR",
    addedAccounts: accounts,
    addedBundles: bundles.map((item) => ({
        campaignBundleId: `campaign-${item.bundleId}`,
        bundleId: item.bundleId,
        influencerId: item.influencerId,
        acceptancePolicy: "all_or_nothing",
        influencerReward: 200,
        clientPrice: 250,
        originalInfluencerReward: 250,
        originalClientPrice: 300,
        pricingStrategy: "proportional",
        currency: "EUR",
        snapshotAt: "2026-08-18T00:00:00.000Z",
    })),
    selectedOffer: selectedOffer
        ? {
            campaignOfferId: `campaign-${selectedOffer.id}`,
            offerId: selectedOffer.id,
            selectedAccountIds: selectedOffer.connectedAccounts.map(
                (item) => item.accountId,
            ),
            selectedAddedAccountsIds: selectedOffer.connectedAccounts.map(
                (item) => `added-${item.accountId}`,
            ),
            overlapAccountIds: [],
            title: selectedOffer.title,
            socialMedia: "instagram",
            genre: "Pop",
            clientPrice: 500,
            originalClientPrice: 500,
            currency: "EUR",
            snapshotAt: "2026-08-18T00:00:00.000Z",
        }
        : null,
    campaignContent: content,
    canEdit: true,
});

const prepare = ({
    accounts,
    bundles = [],
    selectedOffer = null,
}: {
    accounts: ReturnType<typeof account>[];
    bundles?: Bundle[];
    selectedOffer?: PublishedOffer | null;
}) => prepareProposalAddInfluencerBuilderState(
    {
        campaignName: "Proposal",
        snapshot: snapshot({ accounts, bundles, selectedOffer }),
        accounts,
        content,
    },
    {
        bundlesById: new Map(bundles.map((item) => [item.bundleId, item])),
        offer: selectedOffer ?? undefined,
        standaloneAccountsById: new Map(
            accounts
                .filter((item) =>
                    !item.bundleId &&
                    !selectedOffer?.connectedAccounts.some(
                        (offerAccount) =>
                            offerAccount.accountId === item.socialAccountId,
                    ),
                )
                .map((item) => [item.socialAccountId, promo(item.socialAccountId)]),
        ),
    },
);

test("hydrates a standalone-only Proposal Option as mutable Builder selection", () => {
    const state = prepare({ accounts: [account("A")] });

    assert.deepEqual(state.selectedPromoCardIds, ["A"]);
    assert.equal(state.selectedAccounts[0].source, "manual");
    assert.equal(state.selectedAccounts[0].selectedCampaignContentItem?.campaignContentItemId, "content-main");
});

test("hydrates an Offer-only Proposal Option with standard Offer state", () => {
    const selectedOffer = offer("offer-1", ["A", "B", "C"]);
    const state = prepare({
        accounts: [account("A"), account("B"), account("C")],
        selectedOffer,
    });

    assert.equal(state.selectedOfferId, "offer-1");
    assert.deepEqual(state.selectedOfferAccountIds, ["A", "B", "C"]);
    assert.ok(state.selectedAccounts.every((item) => item.source === "offer"));
});

test("hydrates a Bundle-only Proposal Option as selected all-or-nothing package", () => {
    const selectedBundle = bundle("bundle-1", ["A", "B", "C"]);
    const state = prepare({
        accounts: [
            account("A", "bundle-1"),
            account("B", "bundle-1"),
            account("C", "bundle-1"),
        ],
        bundles: [selectedBundle],
    });

    assert.deepEqual(state.selectedBundles.map((item) => item.bundleId), ["bundle-1"]);
    assert.ok(state.selectedAccounts.every((item) => item.source === "bundle"));
});

test("hydrates Offer + standalone and Bundle + standalone mixed topologies", () => {
    const selectedOffer = offer("offer-1", ["A", "B"]);
    const offerState = prepare({
        accounts: [account("A"), account("B"), account("F")],
        selectedOffer,
    });
    assert.deepEqual(offerState.selectedPromoCardIds, ["F"]);

    const selectedBundle = bundle("bundle-1", ["C", "D"]);
    const bundleState = prepare({
        accounts: [
            account("C", "bundle-1"),
            account("D", "bundle-1"),
            account("F"),
        ],
        bundles: [selectedBundle],
    });
    assert.deepEqual(bundleState.selectedPromoCardIds, ["F"]);
});

test("hydrates Offer + Bundle + standalone as one working selection", () => {
    const selectedOffer = offer("offer-1", ["A", "B"]);
    const selectedBundle = bundle("bundle-1", ["C", "D", "E"]);
    const state = prepare({
        accounts: [
            account("A"),
            account("B"),
            account("C", "bundle-1"),
            account("D", "bundle-1"),
            account("E", "bundle-1"),
            account("F"),
        ],
        bundles: [selectedBundle],
        selectedOffer,
    });

    assert.equal(state.selectedOfferId, "offer-1");
    assert.deepEqual(state.selectedBundles.map((item) => item.bundleId), [
        "bundle-1",
    ]);
    assert.deepEqual(state.selectedPromoCardIds, ["F"]);
});

test("hydrates true partial Offer/Bundle overlap without false inclusion", () => {
    const selectedOffer = offer("offer-1", ["A", "B", "C", "D"]);
    const selectedBundle = bundle("bundle-1", ["C", "D", "E"]);
    const state = prepare({
        accounts: [
            account("A"),
            account("B"),
            account("C", "bundle-1"),
            account("D", "bundle-1"),
            account("E", "bundle-1"),
        ],
        bundles: [selectedBundle],
        selectedOffer,
    });

    assert.equal(state.selectedOfferId, "offer-1");
    assert.deepEqual(state.selectedBundles.map((item) => item.bundleId), ["bundle-1"]);
});

test("faithfully hydrates legacy Bundle subset of Offer without mount normalization", () => {
    const selectedOffer = offer("offer-1", ["A", "B", "C", "D"]);
    const selectedBundle = bundle("bundle-1", ["A", "B", "C"]);
    const state = prepare({
        accounts: [
            account("A", "bundle-1"),
            account("B", "bundle-1"),
            account("C", "bundle-1"),
            account("D"),
        ],
        bundles: [selectedBundle],
        selectedOffer,
    });

    assert.equal(state.selectedOfferId, "offer-1");
    assert.deepEqual(state.selectedBundles.map((item) => item.bundleId), ["bundle-1"]);
});

test("standard Offer action absorbs a hydrated Bundle subset", () => {
    const selectedBundle = bundle("bundle-1", ["A", "B", "C"]);
    const state = prepare({
        accounts: [
            account("A", "bundle-1"),
            account("B", "bundle-1"),
            account("C", "bundle-1"),
        ],
        bundles: [selectedBundle],
    });
    const selectedOffer = offer("offer-1", ["A", "B", "C", "D"]);
    const patch = selectOfferFromCampaignSelection({
        state,
        payload: {
            offerId: selectedOffer.id,
            offerName: selectedOffer.title,
            offerPrice: selectedOffer.prices.EUR,
            offerPrices: selectedOffer.prices,
            currency: "EUR",
            accountIds: selectedOffer.connectedAccounts.map((item) => item.accountId),
            accounts: selectedOffer.connectedAccounts.map((item) => ({
                accountId: item.accountId,
                influencerId: item.influencerId,
                socialMedia: item.socialMedia,
                username: item.username,
                profileType: item.profileType,
            })),
        },
    });

    assert.equal(patch.selectedOfferId, "offer-1");
    assert.deepEqual(patch.selectedBundles, []);
});

test("standard Bundle action absorbs a hydrated standalone", () => {
    const state = prepare({ accounts: [account("A")] });
    const selectedBundle = bundle("bundle-1", ["A", "B", "C"]);
    const patch = selectBundleFromCampaignSelection({
        state,
        bundle: selectedBundle,
        currency: "EUR",
    });

    assert.ok(patch);
    assert.deepEqual(patch.selectedPromoCardIds, []);
    assert.deepEqual(patch.selectedBundles?.map((item) => item.bundleId), ["bundle-1"]);
});

test("re-entry requirements prefer pending working topology", () => {
    const persistedBundle = bundle("bundle-1", ["A", "B", "C"]);
    const selectedOffer = offer("offer-1", ["A", "B", "C", "D"]);
    const source = {
        campaignName: "Proposal",
        snapshot: snapshot({
            accounts: [
                account("A", "bundle-1"),
                account("B", "bundle-1"),
                account("C", "bundle-1"),
            ],
            bundles: [persistedBundle],
        }),
        accounts: [account("A"), account("B"), account("C"), account("D")],
        content,
        pendingBundleMembership: {},
        selectedOfferChange: {
            offerId: selectedOffer.id,
            selectedAccountIds: ["A", "B", "C", "D"],
        },
    };
    const requirements = getProposalAddInfluencerRequirements(source);

    assert.deepEqual(requirements.bundleIds, []);
    assert.equal(requirements.offer?.offerId, "offer-1");
});

test("re-entry hydrates unsaved topology and Content instead of persisted snapshot", () => {
    const persistedBundle = bundle("bundle-1", ["A", "B", "C"]);
    const selectedOffer = offer("offer-1", ["A", "B", "C", "D"]);
    const workingAccounts = [
        account("A"),
        account("B"),
        account("C"),
        account("D"),
    ];
    const cachedBuilderState = prepare({
        accounts: workingAccounts,
        selectedOffer,
    });
    const unsavedContent = [{
        ...content[0],
        mainLink: "https://unsaved.example.com",
    }];
    const rehydrated = prepareProposalAddInfluencerBuilderState({
        campaignName: "Proposal",
        snapshot: snapshot({
            accounts: [
                account("A", "bundle-1"),
                account("B", "bundle-1"),
                account("C", "bundle-1"),
            ],
            bundles: [persistedBundle],
        }),
        accounts: workingAccounts,
        content: unsavedContent,
        pendingBundleMembership: {},
        selectedOfferChange: {
            offerId: selectedOffer.id,
            selectedAccountIds: ["A", "B", "C", "D"],
        },
        cachedBuilderState,
    });

    assert.equal(rehydrated.selectedOfferId, "offer-1");
    assert.deepEqual(rehydrated.selectedBundles, []);
    assert.equal(
        rehydrated.campaignContent[0].mainLink,
        "https://unsaved.example.com",
    );
});

test("Add Influencer Selection and Content URLs preserve working catalog context", () => {
    const url = buildProposalAddInfluencerUrl({
        optionIndex: 2,
        currency: "GBP",
        pathname: "/client/create-campaign/content",
        platform: "Instagram",
        genre: "Pop",
    });
    const parsed = new URL(url, "https://soundinfluencers.test");

    assert.equal(parsed.pathname, "/client/create-campaign/content");
    assert.equal(parsed.searchParams.get("mode"), "add-influencer");
    assert.equal(parsed.searchParams.get("option"), "2");
    assert.equal(parsed.searchParams.get("currency"), "GBP");
    assert.equal(parsed.searchParams.get("platform"), "instagram");
    assert.equal(parsed.searchParams.get("genre"), "Pop");
});

test("working roundtrip preserves retained lifecycle ids and does not fabricate new ids", () => {
    const current = account("A", "bundle-1");
    const result = reconcileProposalAccountsFromBuilder({
        currentAccounts: [current],
        builderAccounts: [
            {
                accountId: "A",
                influencerId: current.influencerId,
                socialMedia: current.socialMedia,
                username: current.username,
                source: "offer",
            },
            {
                accountId: "D",
                influencerId: "influencer-D",
                socialMedia: "instagram",
                username: "D",
                source: "offer",
            },
        ],
    });

    assert.equal(result[0].addedAccountsId, "added-A");
    assert.equal(result[0].publicPrice, 100);
    assert.equal(result[0].bundleId, undefined);
    assert.equal(result[0].campaignBundleId, undefined);
    assert.equal(result[1].addedAccountsId, undefined);
});
