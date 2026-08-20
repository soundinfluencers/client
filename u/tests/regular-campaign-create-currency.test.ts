import assert from "node:assert/strict";
import test from "node:test";

import {
    buildStrategyCreateCampaignPayload,
    requireRegularCampaignDisplayCurrency,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload.ts";
import {
    prepareCampaignBuilderStateFromDraft,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft.ts";

const account = {
    accountId: "account-1",
    influencerId: "influencer-1",
    socialMedia: "instagram",
    username: "creator",
    profileType: "creator" as const,
    source: "manual" as const,
    selectedCampaignContentItem: {
        campaignContentItemId: "content-1",
        descriptionId: "description-1",
    },
    dateRequest: "ASAP",
};

const content = [{
    _id: "content-1",
    socialMedia: "instagram",
    socialMediaGroup: "main" as const,
    mainLink: "https://example.com/post",
    descriptions: [{
        _id: "description-1",
        description: "Post brief",
    }],
    taggedUser: "",
    taggedLink: "",
    additionalBrief: [],
    profileType: "creator" as const,
}];

const paymentDetails = {
    firstName: "Client",
    lastName: "User",
    address: "Address",
    country: "GB",
    amount: 1077,
    referenceNumber: "reference-1",
    selectedPaymentMethod: "bank_card",
};

for (const displayCurrency of ["EUR", "USD", "GBP"] as const) {
    test(`regular Campaign serializer preserves ${displayCurrency} and canonical total`, () => {
        const payload = buildStrategyCreateCampaignPayload({
            campaignName: `${displayCurrency} Campaign`,
            totalPrice: 1077,
            displayCurrency,
            accounts: [account],
            content,
            paymentDetails,
        });

        assert.equal(payload.campaignPrice, 1077);
        assert.equal(payload.displayCurrency, displayCurrency);
    });
}

for (const invalidCurrency of [undefined, null, "", "CAD"]) {
    test(`regular Campaign creation rejects invalid currency ${String(invalidCurrency)}`, () => {
        assert.throws(
            () => requireRegularCampaignDisplayCurrency(invalidCurrency),
            /Campaign currency is required before payment/,
        );
    });
}

test("Draft GBP hydration feeds the same regular Campaign serializer", () => {
    const hydrated = prepareCampaignBuilderStateFromDraft({
        _id: "draft-1",
        step: "strategyTable",
        socialMedia: "instagram",
        displayCurrency: "GBP",
        campaignName: "GBP Draft",
        campaignContent: content,
        addedAccounts: [{
            selectionId: "0123456789abcdef01234567",
            source: "standalone",
            influencerId: account.influencerId,
            socialAccountId: account.accountId,
            socialMedia: "instagram",
            username: account.username,
            logoUrl: "",
            profileType: "creator",
            followers: 100,
            prices: { GBP: 1077 },
            dateRequest: "ASAP",
            selectedCampaignContentItem: account.selectedCampaignContentItem,
            isAvailable: true,
        }],
        addedBundles: [],
        selectedOffer: null,
    });
    const displayCurrency = requireRegularCampaignDisplayCurrency(
        hydrated.selectionCurrency,
    );
    const payload = buildStrategyCreateCampaignPayload({
        campaignName: hydrated.campaignName,
        totalPrice: hydrated.totalPrice,
        displayCurrency,
        accounts: hydrated.selectedAccounts,
        content: hydrated.campaignContent,
        paymentDetails: {
            ...paymentDetails,
            amount: hydrated.totalPrice,
        },
    });

    assert.equal(hydrated.selectionCurrency, "GBP");
    assert.equal(hydrated.totalPrice, 1077);
    assert.equal(payload.displayCurrency, "GBP");
    assert.equal(payload.campaignPrice, 1077);
});
