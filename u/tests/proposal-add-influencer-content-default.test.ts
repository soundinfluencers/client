import assert from "node:assert/strict";
import test from "node:test";

import {
    getCompatibleProposalContentItems,
    initializeNewProposalAccountContentSelections,
} from "../src/client-side/widgets/campaign/model/proposal-content-selection.ts";
import {
    buildProposalOptionPatchBody,
} from "../src/client-side/utils/proposal-patch.ts";
import type {
    ProposalOptionDto,
} from "../src/entities/client-side/campaign/model/campaign-api.types.ts";

const description = (id: string) => ({
    _id: id,
    description: id,
});

const content = (
    id: string,
    descriptions = [description(`${id}-description-1`)],
    additionalBrief = [] as Array<{ _id: string; additionalBrief: string }>,
) => ({
    _id: id,
    socialMedia: "instagram" as const,
    socialMediaGroup: "main" as const,
    profileType: "community" as const,
    mainLink: `https://example.com/${id}`,
    descriptions,
    taggedUser: "",
    taggedLink: "",
    additionalBrief,
});

const account = ({
    accountId,
    addedAccountsId,
    selection,
    source = "manual",
}: {
    accountId: string;
    addedAccountsId?: string;
    selection?: {
        campaignContentItemId: string;
        descriptionId: string;
    } | null;
    source?: "manual" | "offer" | "bundle";
}) => ({
    ...(addedAccountsId ? { addedAccountsId } : {}),
    accountId,
    socialAccountId: accountId,
    influencerId: `influencer-${accountId}`,
    socialMedia: "instagram",
    profileType: "community" as const,
    username: accountId,
    followers: 1_000,
    publicPrice: 100,
    price: 100,
    dateRequest: "ASAP",
    source,
    selectedContent: selection ?? null,
    selectedCampaignContentItem: selection ?? null,
});

const initialize = ({
    accounts,
    currentAccounts = [],
    contentItems,
}: {
    accounts: ReturnType<typeof account>[];
    currentAccounts?: ReturnType<typeof account>[];
    contentItems: ReturnType<typeof content>[];
}) => initializeNewProposalAccountContentSelections({
    accounts,
    currentAccounts,
    contentItems,
});

test("initializes the same-group Content[0]/Description[0] pair in both aliases", () => {
    const contentA = content("content-a", undefined, [
        { _id: "brief-a", additionalBrief: "Brief A" },
    ]);
    const result = initialize({
        accounts: [account({ accountId: "D" })],
        contentItems: [contentA],
    });
    const expected = {
        campaignContentItemId: "content-a",
        descriptionId: "content-a-description-1",
        additionalBriefId: "brief-a",
    };

    assert.deepEqual(result.accounts[0].selectedContent, expected);
    assert.deepEqual(result.accounts[0].selectedCampaignContentItem, expected);
    assert.deepEqual(result.unresolvedNewAccountGroups, []);
});

test("initializes multiple new rows and preserves persisted rows", () => {
    const originalSelection = {
        campaignContentItemId: "content-existing",
        descriptionId: "description-existing",
    };
    const existing = ["A", "B", "C"].map((accountId) => account({
        accountId,
        addedAccountsId: `added-${accountId}`,
        selection: originalSelection,
    }));
    const result = initialize({
        accounts: [
            ...existing,
            account({ accountId: "D" }),
            account({ accountId: "E" }),
        ],
        currentAccounts: existing,
        contentItems: [content("content-default")],
    });

    assert.deepEqual(
        result.accounts.slice(0, 3).map((item) => item.selectedContent),
        [originalSelection, originalSelection, originalSelection],
    );
    assert.deepEqual(
        result.accounts.slice(3).map((item) => item.selectedContent),
        [
            {
                campaignContentItemId: "content-default",
                descriptionId: "content-default-description-1",
            },
            {
                campaignContentItemId: "content-default",
                descriptionId: "content-default-description-1",
            },
        ],
    );
});

test("uses the first compatible Content and its first Description", () => {
    const contentA = content("content-a", [
        description("description-a1"),
        description("description-a2"),
        description("description-a3"),
    ]);
    const contentB = content("content-b");
    const contentC = content("content-c");
    const candidate = account({ accountId: "D" });

    assert.deepEqual(
        getCompatibleProposalContentItems(candidate, [contentA, contentB, contentC])
            .map((item) => item._id),
        ["content-a", "content-b", "content-c"],
    );

    const result = initialize({
        accounts: [candidate],
        contentItems: [contentA, contentB, contentC],
    });

    assert.deepEqual(result.accounts[0].selectedContent, {
        campaignContentItemId: "content-a",
        descriptionId: "description-a1",
    });
});

test("preserves an explicit selection across repeated normalization", () => {
    const explicitSelection = {
        campaignContentItemId: "content-b",
        descriptionId: "description-b2",
    };
    const working = account({
        accountId: "D",
        selection: explicitSelection,
    });
    const contentB = content("content-b", [
        description("description-b1"),
        description("description-b2"),
    ]);
    const first = initialize({
        accounts: [working],
        currentAccounts: [working],
        contentItems: [content("content-a"), contentB],
    });
    const second = initialize({
        accounts: first.accounts,
        currentAccounts: first.accounts,
        contentItems: [content("content-a"), contentB],
    });

    assert.deepEqual(first.accounts[0].selectedContent, explicitSelection);
    assert.deepEqual(second.accounts[0].selectedContent, explicitSelection);
});

test("keeps the Content form path unresolved when compatible Content is absent", () => {
    const result = initialize({
        accounts: [account({ accountId: "D" })],
        contentItems: [],
    });

    assert.equal(result.accounts[0].selectedContent, null);
    assert.deepEqual(result.unresolvedNewAccountGroups, ["main"]);
});

test("does not fabricate a selection when Content has no valid Description", () => {
    const result = initialize({
        accounts: [account({ accountId: "D" })],
        contentItems: [content("content-a", [])],
    });

    assert.equal(result.accounts[0].selectedContent, null);
    assert.equal(result.accounts[0].selectedCampaignContentItem, null);
    assert.deepEqual(result.unresolvedNewAccountGroups, ["main"]);
});

test("applies the same default contract independently of package source", () => {
    const result = initialize({
        accounts: [
            account({ accountId: "standalone", source: "manual" }),
            account({ accountId: "offer", source: "offer" }),
            account({ accountId: "bundle", source: "bundle" }),
        ],
        contentItems: [content("content-a")],
    });

    assert.deepEqual(
        result.accounts.map((item) => item.selectedContent),
        Array.from({ length: 3 }, () => ({
            campaignContentItemId: "content-a",
            descriptionId: "content-a-description-1",
        })),
    );
});

test("turns the audited validator failure into a valid current selection", () => {
    const contentA = content("content-a");
    const newAccount = account({ accountId: "D" });
    const snapshot: ProposalOptionDto = {
        optionIndex: 0,
        price: 0,
        displayCurrency: "EUR" as const,
        addedAccounts: [],
        addedBundles: [],
        selectedOffer: null,
        campaignContent: [contentA],
        canEdit: true,
    };
    const before = buildProposalOptionPatchBody({
        campaignName: "Proposal",
        snapshot,
        accounts: [newAccount],
        content: [contentA],
    });

    assert.equal(before.ok, false);
    if (!before.ok) {
        assert.equal(before.code, "invalid_selected_content");
        assert.equal(
            before.message,
            "A Proposal row has no valid current or persisted content selection.",
        );
    }

    const initialized = initialize({
        accounts: [newAccount],
        contentItems: [contentA],
    });
    const after = buildProposalOptionPatchBody({
        campaignName: "Proposal",
        snapshot,
        accounts: initialized.accounts,
        content: [contentA],
    });

    assert.equal(after.ok, true);
    assert.deepEqual(
        initialized.accounts[0].selectedContent,
        initialized.accounts[0].selectedCampaignContentItem,
    );
});
