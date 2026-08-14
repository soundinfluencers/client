import { getSocialMediaIcon } from "@/constants/social-medias";
import type {
    Bundle,
    BundleAccount,
    BundlePriceMap,
} from "@/entities/client-side/campaign-creator-page/bundle";
import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";
import { formatCurrency } from "@/shared/functions/formatCurrency";
import type {
    SocialMediaType,
} from "@/types/utils/constants.types";
import { formatFollowers } from "@/utils/functions/formatFollowers";

import type {
    BundleAccountDisplayModel,
    BundleCardDisplayModel,
    BundleChipDisplayModel,
} from "./bundle-card.types";
import {
    getCampaignCategoryLabel,
} from "./bundle-category-labels";

const SUPPORTED_SOCIAL_MEDIA_TYPES = [
    "instagram",
    "tiktok",
    "facebook",
    "youtube",
    "spotify",
    "soundcloud",
    "press",
    "multipromo",
] as const satisfies readonly SocialMediaType[];

const isSocialMediaType = (value: string): value is SocialMediaType =>
    (SUPPORTED_SOCIAL_MEDIA_TYPES as readonly string[]).includes(value);

const getPlatformIcon = (socialMedia: string): string | null =>
    isSocialMediaType(socialMedia)
        ? getSocialMediaIcon(socialMedia)
        : null;

const getCurrentPriceLabel = (
    prices: BundlePriceMap,
    currency: CampaignCurrencyCode,
): string => {
    const price = prices[currency];

    return price === undefined ? "—" : formatCurrency(price, currency);
};

const getOriginalPriceLabel = (
    prices: BundlePriceMap,
    currency: CampaignCurrencyCode,
): string | null => {
    const price = prices[currency];

    return price === undefined ? null : formatCurrency(price, currency);
};

const percentageFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
});

export const formatBundleCountryPercentage = (
    percentage: number,
): string => percentageFormatter.format(percentage);

const getAccountGenres = (
    account: BundleAccount,
): readonly BundleChipDisplayModel[] =>
    [
        ...account.communityMusicGenres,
        ...account.communityThemeTopics,
        ...account.creatorMusicGenres,
        ...account.creatorContentFocus,
    ].reduce<BundleChipDisplayModel[]>((chips, value) => {
        if (chips.some((chip) => chip.key === value)) {
            return chips;
        }

        chips.push({
            key: value,
            label: getCampaignCategoryLabel(value),
        });

        return chips;
    }, []);

const getAccountCountries = (
    account: BundleAccount,
): readonly BundleChipDisplayModel[] =>
    account.countries.map(({ country, percentage }, index) => ({
        key: `${country}-${percentage}-${index}`,
        label: `${country} ${formatBundleCountryPercentage(percentage)}%`,
    }));

const mapBundleAccountToCardDisplayModel = (
    account: BundleAccount,
    currency: CampaignCurrencyCode,
): BundleAccountDisplayModel => ({
    accountId: account.accountId,
    username: account.username,
    platformIcon: getPlatformIcon(account.socialMedia),
    platformLabel: account.socialMedia,
    followersLabel: formatFollowers(account.followers),
    priceLabel: getCurrentPriceLabel(account.prices, currency),
    genres: getAccountGenres(account),
    countries: getAccountCountries(account),
});

export const mapBundleToCardDisplayModel = (
    bundle: Bundle,
    currency: CampaignCurrencyCode,
): BundleCardDisplayModel => ({
    bundleId: bundle.bundleId,
    followersLabel: formatFollowers(bundle.followers),
    accounts: bundle.accounts.map((account) =>
        mapBundleAccountToCardDisplayModel(account, currency),
    ),
    priceLabel: getCurrentPriceLabel(bundle.prices, currency),
    originalPriceLabel: getOriginalPriceLabel(
        bundle.originalPrices,
        currency,
    ),
});

export const mapBundlesToCardDisplayModels = (
    bundles: readonly Bundle[],
    currency: CampaignCurrencyCode,
): readonly BundleCardDisplayModel[] =>
    bundles.map((bundle) =>
        mapBundleToCardDisplayModel(bundle, currency),
    );
