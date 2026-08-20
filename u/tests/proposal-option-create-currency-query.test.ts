import assert from "node:assert/strict";
import test from "node:test";
import {
    createSerializer,
    parseAsStringLiteral,
} from "nuqs";

import {
    getCampaignCurrencyQueryWriteOptions,
} from "../src/features/client-side/campaign-creator-page/build-campaign-filters/model/campaign-currency-query.ts";
import {
    buildProposalOptionCreateUrl,
    parseProposalOptionCreateContext,
    PROPOSAL_OPTION_CREATE_MODE,
} from "../src/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation.ts";

const CURRENCIES = ["EUR", "USD", "GBP"] as const;
type Currency = (typeof CURRENCIES)[number];

const currencyParser = parseAsStringLiteral(CURRENCIES).withDefault("EUR");

const writeCurrency = (
    searchParams: URLSearchParams,
    currency: Currency,
    history: "push" | "replace" = "push",
): URLSearchParams => {
    const options = getCampaignCurrencyQueryWriteOptions({
        search: searchParams,
        history,
    });
    const serialize = createSerializer(
        { currency: currencyParser },
        { clearOnDefault: options.clearOnDefault ?? true },
    );

    return new URLSearchParams(serialize(searchParams, { currency }));
};

const proposalSearch = (currency: Currency) =>
    new URLSearchParams({
        mode: "proposal-option-create",
        campaignId: "campaign-123",
        returnTo: "/client/campaign",
        currency,
    });

test("initial EUR proposal-option-create URL keeps currency explicit", () => {
    const url = buildProposalOptionCreateUrl("/client/create-campaign", {
        mode: PROPOSAL_OPTION_CREATE_MODE,
        campaignId: "campaign-123",
        returnTo: "/client/campaign",
        currency: "EUR",
    });
    const searchParams = new URLSearchParams(url.split("?")[1]);

    assert.equal(searchParams.get("currency"), "EUR");
    assert.equal(parseProposalOptionCreateContext(searchParams)?.currency, "EUR");
});

for (const [initialCurrency, targetCurrency] of [
    ["GBP", "EUR"],
    ["USD", "EUR"],
    ["EUR", "USD"],
    ["EUR", "GBP"],
] as const) {
    test(`proposal-option-create keeps ${initialCurrency} -> ${targetCurrency} context valid`, () => {
        const result = writeCurrency(
            proposalSearch(initialCurrency),
            targetCurrency,
        );

        assert.equal(result.get("currency"), targetCurrency);
        assert.equal(result.get("mode"), "proposal-option-create");
        assert.equal(result.get("campaignId"), "campaign-123");
        assert.equal(result.get("returnTo"), "/client/campaign");
        assert.equal(
            parseProposalOptionCreateContext(result)?.currency,
            targetCurrency,
        );
    });
}

test("proposal-option-create remains valid across repeated currency switches", () => {
    let result = proposalSearch("GBP");

    for (const currency of ["EUR", "USD", "EUR"] as const) {
        result = writeCurrency(result, currency);
        assert.equal(result.get("currency"), currency);
        assert.equal(
            parseProposalOptionCreateContext(result)?.currency,
            currency,
        );
    }
});

test("proposal-option-create hydration writes also keep EUR explicit", () => {
    const result = writeCurrency(proposalSearch("GBP"), "EUR", "replace");

    assert.equal(result.get("currency"), "EUR");
    assert.equal(parseProposalOptionCreateContext(result)?.currency, "EUR");
});

test("Selection to Content propagation keeps selected EUR explicit", () => {
    const selectionSearch = writeCurrency(proposalSearch("GBP"), "EUR");
    const context = parseProposalOptionCreateContext(selectionSearch);

    assert.ok(context);

    const contentUrl = buildProposalOptionCreateUrl(
        "/client/create-campaign/content",
        context,
    );
    const contentSearch = new URLSearchParams(contentUrl.split("?")[1]);

    assert.equal(contentSearch.get("currency"), "EUR");
    assert.equal(parseProposalOptionCreateContext(contentSearch)?.currency, "EUR");
});

test("proposal-option-create without explicit currency remains invalid", () => {
    const malformed = new URLSearchParams({
        mode: "proposal-option-create",
        campaignId: "campaign-123",
        returnTo: "/client/campaign",
    });

    assert.equal(parseProposalOptionCreateContext(malformed), null);
});

test("Add Influencer keeps existing default-currency URL semantics", () => {
    const result = writeCurrency(
        new URLSearchParams({
            mode: "add-influencer",
            option: "2",
            currency: "GBP",
        }),
        "EUR",
    );

    assert.equal(result.get("currency"), null);
    assert.equal(result.get("mode"), "add-influencer");
    assert.equal(result.get("option"), "2");
});

test("regular Builder keeps existing default-currency URL semantics", () => {
    const result = writeCurrency(
        new URLSearchParams({ currency: "GBP" }),
        "EUR",
    );

    assert.equal(result.get("currency"), null);
});
