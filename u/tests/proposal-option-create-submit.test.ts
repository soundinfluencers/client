import assert from "node:assert/strict";
import test from "node:test";

import {
    buildProposalOptionCreateRequest,
    createProposalOptionCompletionController,
    createProposalOptionSubmitController,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-option-create.submit.ts";

const context = {
    mode: "proposal-option-create" as const,
    campaignId: "campaign-1",
    returnTo: "/client/campaign",
    currency: "GBP" as const,
};

const content = [
    {
        _id: "content-1",
        socialMedia: "instagram",
        socialMediaGroup: "main" as const,
        mainLink: "https://example.com",
        descriptions: [
            {
                _id: "description-1",
                description: "Post brief",
            },
        ],
        taggedUser: "",
        taggedLink: "",
        additionalBrief: "",
        profileType: "creator" as const,
    },
];

const account = ({
    accountId,
    source,
    bundleId,
}: {
    accountId: string;
    source: "manual" | "offer" | "bundle";
    bundleId?: string;
}) => ({
    accountId,
    influencerId: `influencer-${accountId}`,
    socialMedia: "instagram",
    username: `user-${accountId}`,
    profileType: "creator" as const,
    source,
    ...(bundleId ? { bundleId } : {}),
    selectedCampaignContentItem: {
        campaignContentItemId: "content-1",
        descriptionId: "description-1",
    },
    dateRequest: "ASAP",
});

const builder = {
    campaignName: "Parent Proposal",
    totalPrice: 123,
    selectionCurrency: "GBP" as const,
    selectedAccounts: [
        account({ accountId: "standalone", source: "manual" }),
    ],
    campaignContent: content,
    selectedOfferId: null,
    selectedOfferAccountIds: [],
};

test("builds a standalone request from the synchronized Builder snapshot", () => {
    const request = buildProposalOptionCreateRequest({ context, builder });

    assert.equal(request.campaignName, "Parent Proposal");
    assert.equal(request.campaignPrice, 123);
    assert.equal(request.displayCurrency, "GBP");
    assert.equal(request.addedAccounts.length, 1);
    assert.equal(request.addedAccounts[0].dateRequest, "ASAP");
    assert.equal(request.selectedOffer, undefined);
});

test("keeps Bundle business membership without lifecycle ids", () => {
    const request = buildProposalOptionCreateRequest({
        context,
        builder: {
            ...builder,
            selectedAccounts: [
                account({ accountId: "bundle-a", source: "bundle", bundleId: "bundle-1" }),
                account({ accountId: "bundle-b", source: "bundle", bundleId: "bundle-1" }),
            ],
        },
    });

    assert.deepEqual(
        request.addedAccounts.map((item) => item.bundleId),
        ["bundle-1", "bundle-1"],
    );

    const serialized = JSON.stringify(request);
    assert.equal(serialized.includes("campaignBundleId"), false);
    assert.equal(serialized.includes("bundlePosition"), false);
});

test("builds Offer-only membership without added-account lifecycle ids", () => {
    const request = buildProposalOptionCreateRequest({
        context,
        builder: {
            ...builder,
            selectedAccounts: [
                account({ accountId: "offer-a", source: "offer" }),
                account({ accountId: "offer-b", source: "offer" }),
            ],
            selectedOfferId: "offer-1",
            selectedOfferAccountIds: ["offer-a", "offer-b"],
        },
    });

    assert.deepEqual(request.selectedOffer, {
        offerId: "offer-1",
        selectedAccountIds: ["offer-a", "offer-b"],
    });
    assert.equal(
        JSON.stringify(request).includes("selectedAddedAccountsIds"),
        false,
    );
});

test("keeps one physical Offer/Bundle overlap row and business memberships", () => {
    const request = buildProposalOptionCreateRequest({
        context,
        builder: {
            ...builder,
            selectedAccounts: [
                account({ accountId: "standalone", source: "manual" }),
                account({ accountId: "offer-a", source: "offer" }),
                account({ accountId: "overlap", source: "bundle", bundleId: "bundle-1" }),
                account({ accountId: "bundle-b", source: "bundle", bundleId: "bundle-1" }),
            ],
            selectedOfferId: "offer-1",
            selectedOfferAccountIds: ["offer-a", "overlap"],
        },
    });

    assert.equal(
        request.addedAccounts.filter(
            (item) => item.socialAccountId === "overlap",
        ).length,
        1,
    );
    assert.equal(
        request.addedAccounts.find(
            (item) => item.socialAccountId === "overlap",
        )?.bundleId,
        "bundle-1",
    );
    assert.deepEqual(request.selectedOffer, {
        offerId: "offer-1",
        selectedAccountIds: ["offer-a", "overlap"],
    });

    const serialized = JSON.stringify(request);
    assert.equal(serialized.includes("addedAccountsId"), false);
    assert.equal(serialized.includes("campaignOfferId"), false);
    assert.equal(serialized.includes("selectedAddedAccountsIds"), false);
});

test("fails before POST when selected content is incomplete", () => {
    assert.throws(() =>
        buildProposalOptionCreateRequest({
            context,
            builder: {
                ...builder,
                selectedAccounts: [
                    {
                        ...account({ accountId: "broken", source: "manual" }),
                        selectedCampaignContentItem: null,
                    },
                ],
            },
        }),
    );
});

test("preserves optionIndex 7 and allows only one POST", async () => {
    let calls = 0;
    let resolvePost: ((value: {
        campaignId: string;
        optionIndex: number;
    }) => void) | undefined;
    const pendingPost = new Promise<{
        campaignId: string;
        optionIndex: number;
    }>((resolve) => {
        resolvePost = resolve;
    });
    const controller = createProposalOptionSubmitController(async () => {
        calls += 1;
        return pendingPost;
    });
    const request = buildProposalOptionCreateRequest({ context, builder });

    const first = controller.submit(request, context.campaignId);
    const second = controller.submit(request, context.campaignId);

    assert.equal(calls, 1);
    assert.strictEqual(first, second);

    resolvePost?.({ campaignId: context.campaignId, optionIndex: 7 });

    assert.deepEqual(await first, {
        campaignId: context.campaignId,
        optionIndex: 7,
    });
    assert.deepEqual(controller.getCreatedIdentity(), {
        campaignId: context.campaignId,
        optionIndex: 7,
    });

    await controller.submit(request, context.campaignId);
    assert.equal(calls, 1);
});

test("allows retry after a genuine POST failure", async () => {
    let calls = 0;
    const controller = createProposalOptionSubmitController(async () => {
        calls += 1;
        if (calls === 1) throw new Error("POST failed");
        return { campaignId: context.campaignId, optionIndex: 2 };
    });
    const request = buildProposalOptionCreateRequest({ context, builder });

    await assert.rejects(controller.submit(request, context.campaignId));
    assert.equal(controller.isLocked(), false);

    assert.deepEqual(
        await controller.submit(request, context.campaignId),
        { campaignId: context.campaignId, optionIndex: 2 },
    );
    assert.equal(calls, 2);
});

test("completes POST, authoritative load, and finalization once with index 7", async () => {
    let postCalls = 0;
    let hydrateCalls = 0;
    let finalizeCalls = 0;
    const submitController = createProposalOptionSubmitController(async () => {
        postCalls += 1;
        return { campaignId: context.campaignId, optionIndex: 7 };
    });
    const completionController = createProposalOptionCompletionController({
        submitController,
        hydrateCreatedOption: async (created) => {
            hydrateCalls += 1;
            assert.deepEqual(created, {
                campaignId: context.campaignId,
                optionIndex: 7,
            });
        },
    });
    const request = buildProposalOptionCreateRequest({ context, builder });
    const createIdentity = () =>
        submitController.submit(request, context.campaignId);
    const finalize = () => {
        finalizeCalls += 1;
    };

    const first = completionController.complete(createIdentity, finalize);
    const second = completionController.complete(createIdentity, finalize);

    assert.strictEqual(first, second);
    assert.deepEqual(await first, {
        campaignId: context.campaignId,
        optionIndex: 7,
    });
    assert.equal(postCalls, 1);
    assert.equal(hydrateCalls, 1);
    assert.equal(finalizeCalls, 1);
});

test("retries authoritative GET with retained identity and never repeats POST", async () => {
    let postCalls = 0;
    let hydrateCalls = 0;
    let finalizeCalls = 0;
    const submitController = createProposalOptionSubmitController(async () => {
        postCalls += 1;
        return { campaignId: context.campaignId, optionIndex: 7 };
    });
    const completionController = createProposalOptionCompletionController({
        submitController,
        hydrateCreatedOption: async (created) => {
            hydrateCalls += 1;
            assert.equal(created.optionIndex, 7);
            if (hydrateCalls === 1) throw new Error("GET failed");
        },
    });
    const request = buildProposalOptionCreateRequest({ context, builder });
    const createIdentity = () =>
        submitController.submit(request, context.campaignId);
    const finalize = () => {
        finalizeCalls += 1;
    };

    await assert.rejects(
        completionController.complete(createIdentity, finalize),
        /GET failed/,
    );
    assert.deepEqual(completionController.getCreatedIdentity(), {
        campaignId: context.campaignId,
        optionIndex: 7,
    });
    assert.equal(postCalls, 1);
    assert.equal(finalizeCalls, 0);

    await completionController.complete(createIdentity, finalize);

    assert.equal(postCalls, 1);
    assert.equal(hydrateCalls, 2);
    assert.equal(finalizeCalls, 1);
});

test("does not load, finalize, or lock after a genuine POST failure", async () => {
    let postCalls = 0;
    let hydrateCalls = 0;
    let finalizeCalls = 0;
    const submitController = createProposalOptionSubmitController(async () => {
        postCalls += 1;
        if (postCalls === 1) throw new Error("POST failed");
        return { campaignId: context.campaignId, optionIndex: 3 };
    });
    const completionController = createProposalOptionCompletionController({
        submitController,
        hydrateCreatedOption: async () => {
            hydrateCalls += 1;
        },
    });
    const request = buildProposalOptionCreateRequest({ context, builder });
    const createIdentity = () =>
        submitController.submit(request, context.campaignId);
    const finalize = () => {
        finalizeCalls += 1;
    };

    await assert.rejects(
        completionController.complete(createIdentity, finalize),
        /POST failed/,
    );
    assert.equal(hydrateCalls, 0);
    assert.equal(finalizeCalls, 0);
    assert.equal(submitController.isLocked(), false);

    await completionController.complete(createIdentity, finalize);

    assert.equal(postCalls, 2);
    assert.equal(hydrateCalls, 1);
    assert.equal(finalizeCalls, 1);
});
