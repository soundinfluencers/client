import assert from "node:assert/strict";
import test from "node:test";

import {
    CreateProposalOptionResponseValidationError,
    isAuthoritativeCreatedProposalOption,
    isCreatedProposalOptionForCampaign,
    parseCreateProposalOptionResponse,
} from "../src/entities/client-side/campaign/model/proposal-option-response.ts";

const created = {
    campaignId: "campaign-1",
    optionIndex: 7,
};

const authoritativeOption = {
    campaignId: "campaign-1",
    campaignName: "Campaign",
    socialMedia: "multipromo" as const,
    existingOptions: [0, 1, 7],
    selectedOption: {
        optionIndex: 7,
        price: 123,
        displayCurrency: "GBP" as const,
        addedAccounts: [],
        addedBundles: [],
        selectedOffer: null,
        campaignContent: [],
        canEdit: true,
    },
};

test("unwraps the real create Proposal option backend envelope", () => {
    assert.deepEqual(
        parseCreateProposalOptionResponse({
            statusCode: 201,
            message: "Success",
            data: {
                campaignId: "campaign-1",
                optionIndex: 1,
            },
        }),
        {
            campaignId: "campaign-1",
            optionIndex: 1,
        },
    );
});

test("preserves an authoritative non-sequential option index", () => {
    assert.equal(
        parseCreateProposalOptionResponse({
            statusCode: 201,
            message: "Success",
            data: {
                campaignId: "campaign-1",
                optionIndex: 7,
            },
        }).optionIndex,
        7,
    );
});

test("rejects a missing option index", () => {
    assert.throws(
        () =>
            parseCreateProposalOptionResponse({
                statusCode: 201,
                message: "Success",
                data: { campaignId: "campaign-1" },
            }),
        CreateProposalOptionResponseValidationError,
    );
});

for (const optionIndex of [-1, 1.5, "1"]) {
    test(`rejects invalid option index ${optionIndex}`, () => {
        assert.throws(() =>
            parseCreateProposalOptionResponse({
                statusCode: 201,
                message: "Success",
                data: {
                    campaignId: "campaign-1",
                    optionIndex,
                },
            }),
        );
    });
}

test("rejects a created identity for a different campaign", () => {
    assert.equal(
        isCreatedProposalOptionForCampaign(
            {
                campaignId: "campaign-2",
                optionIndex: 1,
            },
            "campaign-1",
        ),
        false,
    );
});

test("accepts an authoritative GET for the exact returned index", () => {
    assert.equal(
        isAuthoritativeCreatedProposalOption(authoritativeOption, created),
        true,
    );
});

test("rejects an authoritative GET selected-option mismatch", () => {
    assert.equal(
        isAuthoritativeCreatedProposalOption(
            {
                ...authoritativeOption,
                selectedOption: {
                    ...authoritativeOption.selectedOption,
                    optionIndex: 6,
                },
            },
            created,
        ),
        false,
    );
});

test("rejects an authoritative GET existing-options mismatch", () => {
    assert.equal(
        isAuthoritativeCreatedProposalOption(
            {
                ...authoritativeOption,
                existingOptions: [0, 1],
            },
            created,
        ),
        false,
    );
});

test("rejects an authoritative GET campaign mismatch", () => {
    assert.equal(
        isAuthoritativeCreatedProposalOption(
            {
                ...authoritativeOption,
                campaignId: "campaign-2",
            },
            created,
        ),
        false,
    );
});
