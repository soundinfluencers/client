import assert from "node:assert/strict";
import test from "node:test";

import {
    buildProposalAddInfluencerUrl,
    buildProposalOptionCreateUrl,
    initializeProposalAddInfluencerCurrency,
    parseProposalOptionCreateContext,
    PROPOSAL_OPTION_CREATE_MODE,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation.ts";
import {
    buildCampaignCurrencySwitch,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-currency.ts";
import {
    createProposalOptionCompletionController,
    createProposalOptionSubmitController,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-option-create.submit.ts";

const controllerRequest = {
    campaignName: "Proposal",
    socialMedia: "instagram",
    campaignPrice: 100,
    displayCurrency: "GBP" as const,
    addedAccounts: [],
    campaignContent: [],
};

for (const currency of ["EUR", "USD", "GBP"] as const) {
    test(`Add Influencer initializes Builder in persisted ${currency}`, () => {
        const events: string[] = [];
        const initialized = initializeProposalAddInfluencerCurrency({
            currency,
            reset: () => events.push("reset"),
            switchCurrency: (nextCurrency) => {
                events.push(`currency:${nextCurrency}`);
                return { ok: true };
            },
        });

        assert.equal(initialized, true);
        assert.deepEqual(events, ["reset", `currency:${currency}`]);
        assert.equal(
            buildProposalAddInfluencerUrl({ optionIndex: 2, currency }),
            `/client/create-campaign?mode=add-influencer&option=2&currency=${currency}`,
        );
    });
}

test("Add Influencer fails closed for missing persisted currency", () => {
    let resetCalls = 0;
    let switchCalls = 0;
    const initialized = initializeProposalAddInfluencerCurrency({
        currency: undefined,
        reset: () => {
            resetCalls += 1;
        },
        switchCurrency: () => {
            switchCalls += 1;
            return { ok: true };
        },
    });

    assert.equal(initialized, false);
    assert.equal(resetCalls, 0);
    assert.equal(switchCalls, 0);
});

test("existing Builder preset maps follow the initialized catalog currency", () => {
    const state = {
        selectedOfferId: "offer-1",
        selectedOfferPrices: { EUR: 100, USD: 120, GBP: 90 },
        selectedOfferAccountIds: [],
        selectedAccounts: [{
            accountId: "standalone-1",
            influencerId: "influencer-1",
            socialMedia: "instagram",
            username: "creator",
            source: "manual" as const,
            price: 10,
            prices: { EUR: 10, USD: 12, GBP: 9 },
        }],
        selectedBundles: [{
            bundleId: "bundle-1",
            influencerId: "influencer-2",
            prices: { EUR: 200, USD: 240, GBP: 180 },
            originalPrices: { EUR: 220, USD: 260, GBP: 200 },
            followers: 0,
            accounts: [],
            createdAt: "",
        }],
    };
    const expected = {
        EUR: { offer: 100, account: 10, total: 310 },
        USD: { offer: 120, account: 12, total: 372 },
        GBP: { offer: 90, account: 9, total: 279 },
    } as const;

    for (const currency of ["EUR", "USD", "GBP"] as const) {
        const result = buildCampaignCurrencySwitch(state, currency);

        assert.equal(result.result.ok, true);
        assert.ok(result.patch);
        assert.equal(result.patch.selectionCurrency, currency);
        assert.equal(result.patch.selectedOfferPrice, expected[currency].offer);
        assert.equal(result.patch.selectedAccounts[0].price, expected[currency].account);
        assert.equal(result.patch.totalPrice, expected[currency].total);
    }
});

test("Proposal Option create GBP navigation contract remains unchanged", () => {
    const url = buildProposalOptionCreateUrl("/client/create-campaign", {
        mode: PROPOSAL_OPTION_CREATE_MODE,
        campaignId: "campaign-1",
        returnTo: "/client/campaign",
        currency: "GBP",
    });
    const parsed = parseProposalOptionCreateContext(
        new URLSearchParams(url.split("?")[1]),
    );

    assert.equal(parsed?.currency, "GBP");
    assert.equal(parsed?.campaignId, "campaign-1");
});

test("successful option completion enters terminal finalization after hydration", async () => {
    const events: string[] = [];
    const submitController = createProposalOptionSubmitController(async () => {
        events.push("post");
        return { campaignId: "campaign-1", optionIndex: 7 };
    });
    const completionController = createProposalOptionCompletionController({
        submitController,
        hydrateCreatedOption: async () => {
            events.push("hydrate");
        },
    });

    await completionController.complete(
        () => submitController.submit(controllerRequest, "campaign-1"),
        () => {
            events.push("finalizing");
            events.push("reset");
            events.push("navigate");
        },
    );

    assert.deepEqual(events, [
        "post",
        "hydrate",
        "finalizing",
        "reset",
        "navigate",
    ]);
});

test("GET failure never enters finalization and retries GET without another POST", async () => {
    let postCalls = 0;
    let hydrateCalls = 0;
    let finalizingCalls = 0;
    const submitController = createProposalOptionSubmitController(async () => {
        postCalls += 1;
        return { campaignId: "campaign-1", optionIndex: 7 };
    });
    const completionController = createProposalOptionCompletionController({
        submitController,
        hydrateCreatedOption: async () => {
            hydrateCalls += 1;
            if (hydrateCalls === 1) throw new Error("GET failed");
        },
    });
    const createIdentity = () =>
        submitController.submit(controllerRequest, "campaign-1");
    const finalize = () => {
        finalizingCalls += 1;
    };

    await assert.rejects(
        completionController.complete(createIdentity, finalize),
        /GET failed/,
    );
    assert.equal(finalizingCalls, 0);

    await completionController.complete(createIdentity, finalize);

    assert.equal(postCalls, 1);
    assert.equal(hydrateCalls, 2);
    assert.equal(finalizingCalls, 1);
});
