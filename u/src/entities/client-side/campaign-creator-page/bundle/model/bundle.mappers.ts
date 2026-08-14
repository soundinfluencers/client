import type {
    BundleAccountDto,
    BundleDto,
    GetFilteredBundlesDataDto,
} from "../api/bundle.dto";
import type {
    Bundle,
    BundleAccount,
} from "./bundle.types";

export const mapBundleAccountDto = (
    dto: BundleAccountDto,
): BundleAccount => ({
    accountId: dto.accountId,
    influencerId: dto.influencerId,
    username: dto.username,
    logoUrl: dto.logoUrl ?? "",
    followers: dto.followers,
    prices: { ...dto.prices },
    socialMedia: dto.socialMedia.toLowerCase(),
    profileType: dto.profileType,
    countries: (dto.countries ?? []).map(({ country, percentage }) => ({
        country,
        percentage,
    })),
    engagementRate: dto.engagementRate,
    averageViews: dto.averageViews,
    communityMusicGenres: [...dto.communityMusicGenres],
    communityThemeTopics: [...dto.communityThemeTopics],
    creatorMusicGenres: [...dto.creatorMusicGenres],
    creatorContentFocus: [...dto.creatorContentFocus],
});

export const mapBundleDto = (dto: BundleDto): Bundle => ({
    bundleId: dto.bundleId,
    influencerId: dto.influencerId,
    prices: { ...dto.prices },
    originalPrices: { ...dto.originalPrices },
    followers: dto.followers,
    accounts: dto.accounts.map(mapBundleAccountDto),
    createdAt: dto.createdAt,
});

export const mapFilteredBundlesDto = (
    dto: GetFilteredBundlesDataDto,
): Bundle[] => dto.bundles.map(mapBundleDto);
