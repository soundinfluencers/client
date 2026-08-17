import assert from "node:assert/strict";
import test from "node:test";

import type {
    Bundle,
} from "../src/entities/client-side/campaign-creator-page/bundle/model/bundle.types.ts";

import {
    calculateCampaignSelectionTotal,
    getBundleSelectionBlockReason,
    isExactOfferBundleOverlap,
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

for (const [offerAccountIds, bundleAccountIds, expected] of [
    [["A", "B", "C"], ["A", "B", "C"], true],
    [["C", "A", "B"], ["A", "B", "C"], true],
    [["A", "B", "C", "D"], ["A", "B", "C"], false],
    [["A", "B"], ["A", "B", "C"], false],
    [["A", "B", "C"], ["A", "B", "D"], false],
] as const) {
    test(`exact Offer/Bundle Set equality: ${offerAccountIds.join("")} / ${bundleAccountIds.join("")}`, () => {
        assert.equal(
            isExactOfferBundleOverlap(
                offerAccountIds,
                createBundle("bundle", bundleAccountIds),
            ),
            expected,
        );
    });
}

test("exact equality normalizes duplicate business account IDs", () => {
    assert.equal(
        isExactOfferBundleOverlap(
            ["A", "A", "B", "C"],
            createBundle("bundle", ["C", "B", "B", "A"]),
        ),
        true,
    );
});

test("Offer-first blocks an exact Bundle and leaves Offer-only total", () => {
    const bundle = createBundle("bundle-abc", ["A", "B", "C"]);
    const state = {
        ...createSelectionState(),
        ...selectOffer(createSelectionState(), ["A", "B", "C"]),
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

test("Bundle-first exact transition selects Offer and removes Bundle in one patch", () => {
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
        ["A", "B", "C"],
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

test("Bundle-first atomically removes only exact Bundles when Offer is selected", () => {
    const exactBundle = createBundle("bundle-abc", ["A", "B", "C"]);
    const secondExactBundle = createBundle(
        "bundle-abc-copy",
        ["C", "A", "B"],
    );
    const partialBundle = createBundle("bundle-cde", ["C", "D", "E"], 400);
    const before = {
        ...createSelectionState(),
        selectionCurrency: "EUR" as const,
        selectedBundles: [
            exactBundle,
            secondExactBundle,
            partialBundle,
        ],
    };
    const patch = selectOffer(before, ["A", "B", "C"]);

    assert.equal(patch.selectedOfferId, "offer-1");
    assert.deepEqual(
        patch.selectedBundles?.map((bundle) => bundle.bundleId),
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
        2300,
    );
});

test("partial overlap remains selected and keeps existing pricing semantics", () => {
    const bundle = createBundle("bundle-abc", ["A", "B", "C"]);
    const before = {
        ...createSelectionState(),
        selectionCurrency: "EUR" as const,
        selectedBundles: [bundle],
    };
    const patch = selectOffer(before, ["A", "B", "C", "D"]);

    assert.deepEqual(
        patch.selectedBundles?.map((item) => item.bundleId),
        ["bundle-abc"],
    );
    assert.equal(
        calculateCampaignSelectionTotal({
            offerPrice: patch.selectedOfferPrice ?? 0,
            selectedAccounts: patch.selectedAccounts ?? [],
            selectedBundles: patch.selectedBundles ?? [],
            selectedOfferAccountIds: patch.selectedOfferAccountIds ?? [],
            currency: "EUR",
        }),
        1950,
    );
});

test("removing or replacing Offer never restores an auto-unselected Bundle", () => {
    const bundle = createBundle("bundle-abc", ["A", "B", "C"]);
    const before = {
        ...createSelectionState(),
        selectionCurrency: "EUR" as const,
        selectedBundles: [bundle],
    };
    const exactOfferState = {
        ...before,
        ...selectOffer(before, ["A", "B", "C"]),
    };
    const removedOfferPatch = selectOffer(exactOfferState, []);
    const replacedOfferPatch = selectOffer(
        exactOfferState,
        ["A", "B", "C", "D"],
        "offer-2",
    );

    assert.deepEqual(removedOfferPatch.selectedBundles, undefined);
    assert.equal(removedOfferPatch.selectedOfferId, null);
    assert.deepEqual(exactOfferState.selectedBundles, []);
    assert.deepEqual(replacedOfferPatch.selectedBundles, []);
    assert.equal(
        isExactOfferBundleOverlap(["A", "B", "C", "D"], bundle),
        false,
    );
});
