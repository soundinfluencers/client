import assert from "node:assert/strict";
import test from "node:test";

import type {
    Bundle,
} from "../src/entities/client-side/campaign-creator-page/bundle/model/bundle.types.ts";

import {
    calculateCampaignSelectionTotal,
    getBundleSelectionBlockReason,
    isBundleFullyIncludedInOffer,
    selectBundleFromCampaignSelection,
    selectOfferFromCampaignSelection,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-selection.ts";

type SelectionState = Parameters<
    typeof selectOfferFromCampaignSelection
>[0]["state"];

const createBundle = (
    bundleId: string,
    accountIds: readonly string[],
    price = 250,
): Bundle => ({
    bundleId,
    influencerId: `influencer-${bundleId}`,
    prices: { EUR: price },
    originalPrices: { EUR: price },
    followers: 0,
    accounts: accountIds.map((accountId) => ({
        accountId,
        influencerId: `influencer-${accountId}`,
        username: accountId,
        logoUrl: "",
        followers: 0,
        prices: { EUR: 100 },
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
    createdAt: "",
});

const createSelectionState = (): SelectionState => ({
    selectedOfferId: null,
    selectedOfferName: "",
    selectedOfferPrice: undefined,
    selectedOfferPrices: {},
    selectionCurrency: null,
    selectedOfferAccountIds: [],
    selectedPromoCardIds: [],
    selectedAccounts: [],
    selectedBundles: [],
});

const selectOffer = (
    state: SelectionState,
    accountIds: readonly string[],
    offerId = "offer-1",
) =>
    selectOfferFromCampaignSelection({
        state,
        payload: {
            offerId,
            offerName: offerId,
            offerPrice: 2000,
            offerPrices: { EUR: 2000 },
            currency: "EUR",
            accountIds: [...accountIds],
            accounts: accountIds.map((accountId) => ({
                accountId,
                influencerId: `influencer-${accountId}`,
                socialMedia: "instagram",
                username: accountId,
                source: "offer" as const,
            })),
        },
    });

for (const [bundleAccountIds, offerAccountIds, expected] of [
    [["A", "B", "C"], ["A", "B", "C"], true],
    [["A", "B", "C"], ["A", "B", "C", "D"], true],
    [["C", "A", "B"], ["A", "B", "C", "D", "E"], true],
    [["A", "B", "C"], ["A", "B", "D", "E"], false],
    [["C", "D", "E"], ["A", "B", "C", "D"], false],
    [["A", "B", "C", "D"], ["A", "B", "C"], false],
] as const) {
    test(`Bundle subset of Offer: ${bundleAccountIds.join("")} / ${offerAccountIds.join("")}`, () => {
        assert.equal(
            isBundleFullyIncludedInOffer(
                createBundle("bundle", bundleAccountIds),
                offerAccountIds,
            ),
            expected,
        );
    });
}

test("Bundle inclusion normalizes duplicate business account IDs", () => {
    assert.equal(
        isBundleFullyIncludedInOffer(
            createBundle("bundle", ["C", "B", "B", "A"]),
            ["A", "A", "B", "C", "D"],
        ),
        true,
    );
});

test("empty or malformed Bundle membership is not treated as included", () => {
    assert.equal(
        isBundleFullyIncludedInOffer(
            createBundle("empty-bundle", []),
            ["A", "B"],
        ),
        false,
    );
    assert.equal(
        isBundleFullyIncludedInOffer(
            createBundle("malformed-bundle", ["A", ""]),
            ["A", "B"],
        ),
        false,
    );
});

test("Offer-first blocks a fully-contained Bundle and leaves Offer-only total", () => {
    const bundle = createBundle("bundle-abc", ["A", "B", "C"]);
    const state = {
        ...createSelectionState(),
        ...selectOffer(createSelectionState(), ["A", "B", "C", "D"]),
    };
    const beforeBlockedChoose = structuredClone(state);

    assert.equal(
        getBundleSelectionBlockReason({
            bundle,
            selectedBundles: state.selectedBundles,
            selectedOfferId: state.selectedOfferId,
            selectedOfferAccountIds: state.selectedOfferAccountIds,
            currency: "EUR",
        }),
        "included-in-selected-offer",
    );
    assert.equal(
        selectBundleFromCampaignSelection({
            state,
            bundle,
            currency: "EUR",
        }),
        null,
    );
    assert.deepEqual(state, beforeBlockedChoose);
    assert.equal(state.selectedBundles.length, 0);
    assert.equal(
        calculateCampaignSelectionTotal({
            offerPrice: state.selectedOfferPrice ?? 0,
            selectedAccounts: state.selectedAccounts,
            selectedBundles: state.selectedBundles,
            selectedOfferAccountIds: state.selectedOfferAccountIds,
            currency: "EUR",
        }),
        2000,
    );
});

test("Bundle-first subset transition selects Offer and removes Bundle in one patch", () => {
    const bundle = createBundle("bundle-abc", ["A", "B", "C"]);
    const initialState = createSelectionState();
    const bundlePatch = selectBundleFromCampaignSelection({
        state: initialState,
        bundle,
        currency: "EUR",
    });

    assert.ok(bundlePatch);
    const bundleSelectedState = {
        ...initialState,
        ...bundlePatch,
    };
    const offerPatch = selectOffer(
        bundleSelectedState,
        ["A", "B", "C", "D"],
    );

    assert.equal(offerPatch.selectedOfferId, "offer-1");
    assert.deepEqual(offerPatch.selectedBundles, []);
    assert.equal(
        calculateCampaignSelectionTotal({
            offerPrice: offerPatch.selectedOfferPrice ?? 0,
            selectedAccounts: offerPatch.selectedAccounts ?? [],
            selectedBundles: offerPatch.selectedBundles ?? [],
            selectedOfferAccountIds:
                offerPatch.selectedOfferAccountIds ?? [],
            currency: "EUR",
        }),
        2000,
    );
});

test("Offer selection removes every contained Bundle and preserves a true partial Bundle", () => {
    const firstIncludedBundle = createBundle("bundle-ab", ["A", "B"]);
    const secondIncludedBundle = createBundle("bundle-cd", ["C", "D"]);
    const partialBundle = createBundle("bundle-def", ["D", "E", "F"], 400);
    const before = {
        ...createSelectionState(),
        selectionCurrency: "EUR" as const,
        selectedBundles: [
            firstIncludedBundle,
            secondIncludedBundle,
            partialBundle,
        ],
    };
    const patch = selectOffer(before, ["A", "B", "C", "D", "E"]);

    assert.equal(patch.selectedOfferId, "offer-1");
    assert.deepEqual(
        patch.selectedBundles?.map((bundle) => bundle.bundleId),
        ["bundle-def"],
    );
    assert.equal(
        calculateCampaignSelectionTotal({
            offerPrice: patch.selectedOfferPrice ?? 0,
            selectedAccounts: patch.selectedAccounts ?? [],
            selectedBundles: patch.selectedBundles ?? [],
            selectedOfferAccountIds: patch.selectedOfferAccountIds ?? [],
            currency: "EUR",
        }),
        2200,
    );
});

test("true partial overlap remains selected and keeps existing pricing semantics", () => {
    const bundle = createBundle("bundle-cde", ["C", "D", "E"], 400);
    const before = {
        ...createSelectionState(),
        selectionCurrency: "EUR" as const,
        selectedBundles: [bundle],
    };
    const patch = selectOffer(before, ["A", "B", "C", "D"]);

    assert.deepEqual(
        patch.selectedBundles?.map((item) => item.bundleId),
        ["bundle-cde"],
    );
    assert.equal(
        calculateCampaignSelectionTotal({
            offerPrice: patch.selectedOfferPrice ?? 0,
            selectedAccounts: patch.selectedAccounts ?? [],
            selectedBundles: patch.selectedBundles ?? [],
            selectedOfferAccountIds: patch.selectedOfferAccountIds ?? [],
            currency: "EUR",
        }),
        2200,
    );
});

test("removing or replacing Offer never restores an auto-unselected Bundle", () => {
    const bundle = createBundle("bundle-abc", ["A", "B", "C"]);
    const before = {
        ...createSelectionState(),
        selectionCurrency: "EUR" as const,
        selectedBundles: [bundle],
    };
    const fullyContainedOfferState = {
        ...before,
        ...selectOffer(before, ["A", "B", "C", "D"]),
    };
    const removedOfferPatch = selectOffer(fullyContainedOfferState, []);
    const replacedOfferPatch = selectOffer(
        fullyContainedOfferState,
        ["A", "B", "D", "E"],
        "offer-2",
    );

    assert.deepEqual(removedOfferPatch.selectedBundles, undefined);
    assert.equal(removedOfferPatch.selectedOfferId, null);
    assert.deepEqual(fullyContainedOfferState.selectedBundles, []);
    assert.deepEqual(replacedOfferPatch.selectedBundles, []);
    assert.equal(
        isBundleFullyIncludedInOffer(bundle, ["A", "B", "D", "E"]),
        false,
    );
});
