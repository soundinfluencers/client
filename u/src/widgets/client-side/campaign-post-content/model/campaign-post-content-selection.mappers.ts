import type {
    SelectedBundleSnapshot,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";
import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";

import type {
    CampaignPostContentBundleSummary,
} from "./campaign-post-content.types";

export const mapSelectedBundlesToPostContentSummaries = (
    bundles: readonly SelectedBundleSnapshot[],
    currency?: CampaignCurrencyCode,
): CampaignPostContentBundleSummary[] =>
    bundles.map((bundle) => ({
        bundleId: bundle.bundleId,
        currentPrice: currency
            ? bundle.prices[currency]
            : undefined,
        originalPrice: currency
            ? bundle.originalPrices[currency]
            : undefined,
        accounts: bundle.accounts.map((account) => ({
            accountId: account.accountId,
            username: account.username,
            socialMedia: account.socialMedia,
            followers: account.followers,
            price: currency
                ? account.prices[currency]
                : undefined,
        })),
    }));
