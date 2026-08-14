import { getSocialMediaIcon } from "@/constants/social-medias";
import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";
import type {
    NetworkBundlePreview,
    NetworkBundlePreviewPriceMap,
} from "@/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.types";
import type {
    BundleCompactAccountDisplayModel,
} from "@/entities/client-side/campaign-creator-page/bundle/ui/bundle-card/bundle-card.types";
import { formatCurrency } from "@/shared/functions/formatCurrency";
import type {
    SocialMediaType,
} from "@/types/utils/constants.types";
import { formatFollowers } from "@/utils/functions/formatFollowers";

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
    prices: NetworkBundlePreviewPriceMap,
    currency: CampaignCurrencyCode,
): string => {
    const price = prices[currency];

    return price === undefined ? "—" : formatCurrency(price, currency);
};

const getOriginalPriceLabel = (
    prices: NetworkBundlePreviewPriceMap,
    currency: CampaignCurrencyCode,
): string | null => {
    const price = prices[currency];

    return price === undefined ? null : formatCurrency(price, currency);
};

export type EmbeddedBundlePreviewDisplayModel = {
    bundleId: string;
    accounts: readonly BundleCompactAccountDisplayModel[];
    priceLabel: string;
    originalPriceLabel: string | null;
};

export const mapNetworkBundlePreviewToDisplayModel = (
    preview: NetworkBundlePreview,
    currency: CampaignCurrencyCode,
): EmbeddedBundlePreviewDisplayModel => ({
    bundleId: preview.bundleId,
    accounts: preview.accounts.map((account) => ({
        accountId: account.accountId,
        username: account.username,
        platformIcon: getPlatformIcon(account.socialMedia),
        platformLabel: account.socialMedia,
        followersLabel: formatFollowers(account.followers),
        priceLabel: getCurrentPriceLabel(account.prices, currency),
    })),
    priceLabel: getCurrentPriceLabel(preview.prices, currency),
    originalPriceLabel: getOriginalPriceLabel(
        preview.originalPrices,
        currency,
    ),
});

export const mapNetworkBundlePreviewsToDisplayModels = (
    previews: readonly NetworkBundlePreview[],
    currency: CampaignCurrencyCode,
): readonly EmbeddedBundlePreviewDisplayModel[] =>
    previews.map((preview) =>
        mapNetworkBundlePreviewToDisplayModel(preview, currency),
    );
