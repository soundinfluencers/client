import assert from "node:assert/strict";
import test from "node:test";

import { mapCampaignListItemDto } from "../src/entities/client-side/dashboard/model/campaign.mappers.ts";
import {
    formatDashboardCampaignPrice,
} from "../src/entities/client-side/dashboard/model/campaign-price.ts";
import { getCampaignCurrencySymbol } from "../src/shared/functions/formatCurrency.ts";

const currencies = ["EUR", "USD", "GBP"] as const;

for (const displayCurrency of currencies) {
    test(`preserves and renders ${displayCurrency} from the CLIENT Dashboard DTO`, () => {
        const campaign = mapCampaignListItemDto({
            _id: `campaign-${displayCurrency}`,
            campaignName: `${displayCurrency} Campaign`,
            socialMedia: "instagram",
            creationDate: "14.08.26",
            price: 634,
            displayCurrency,
            status: "under_review",
        });

        assert.equal(campaign.displayCurrency, displayCurrency);
        assert.equal(
            formatDashboardCampaignPrice(campaign),
            `634${getCampaignCurrencySymbol(displayCurrency)}`,
        );
    });
}

for (const status of ["under_review", "distributing", "closed"] as const) {
    test(`preserves displayCurrency for the ${status} Dashboard filter`, () => {
        const campaign = mapCampaignListItemDto({
            _id: `campaign-${status}`,
            campaignName: `${status} Campaign`,
            socialMedia: "instagram",
            creationDate: "14.08.26",
            price: 634,
            displayCurrency: "GBP",
            status,
        });

        assert.equal(campaign.status, status);
        assert.equal(campaign.displayCurrency, "GBP");
        assert.equal(formatDashboardCampaignPrice(campaign), "634£");
    });
}

test("does not infer EUR when persisted displayCurrency is missing", () => {
    assert.equal(
        formatDashboardCampaignPrice({
            price: 634,
            displayCurrency: undefined,
        }),
        "—",
    );
});
