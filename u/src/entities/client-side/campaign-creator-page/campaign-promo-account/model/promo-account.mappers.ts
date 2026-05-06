import type {
    PromoAccountCountryDto,
    PromoAccountDto,
} from "../api/promo-account.dto";
import type {
    PromoAccount,
    PromoAccountCountry,
} from "../model/promo-account.types";

const mapCountry = (value: PromoAccountCountryDto): PromoAccountCountry => {
    if (typeof value === "string") {
        return {
            country: value,
            percentage: 0,
        };
    }

    return {
        country: String(value.country ?? ""),
        percentage: Number(value.percentage ?? 0),
    };
};

export const mapPromoAccountDto = (dto: PromoAccountDto): PromoAccount => ({
    accountId: String(dto.accountId ?? ""),
    influencerId: String(dto.influencerId ?? ""),
    username: String(dto.username ?? ""),
    logoUrl: String(dto.logoUrl ?? ""),
    followers: Number(dto.followers ?? 0),
    prices: dto.prices ?? {},
    engagementRate: Number(dto.engagementRate ?? 0),
    averageViews: Number(dto.averageViews ?? 0),
    socialMedia: String(dto.socialMedia ?? "").toLowerCase(),
    profileType: dto.profileType,
    countries: Array.isArray(dto.countries) ? dto.countries.map(mapCountry) : [],
    musicGenres: Array.isArray(dto.musicGenres) ? dto.musicGenres : [],
    creatorCategories: Array.isArray(dto.creatorCategories)
        ? dto.creatorCategories
        : [],
    categories: Array.isArray(dto.categories) ? dto.categories : [],
});