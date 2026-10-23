import type {
    OfferConnectedAccountDto,
    PublishedOfferDto,
} from "../api/offer.types";
import type {
    OfferConnectedAccount,
    PublishedOffer,
} from "../model/offer.types";
import type { OfferPrices } from "../../campaign-builder/model/selected-offer";

// Published prices are already converted whole units. Invalid/missing is not zero.
const mapPrices = (prices: PublishedOfferDto["parsedPrices"]): Partial<OfferPrices> => {
    const result: Partial<OfferPrices> = {};
    for (const currency of ["EUR", "USD", "GBP"] as const) {
        const price = prices?.[currency];
        if (typeof price === "number" && Number.isSafeInteger(price) && price >= 0) {
            result[currency] = price;
        }
    }
    return result;
};

const toNumber = (value: unknown): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

export const mapOfferConnectedAccountDto = (
    dto: OfferConnectedAccountDto,
): OfferConnectedAccount => ({
    accountId: String(dto.accountId ?? ""),
    influencerId: String(dto.influencerId ?? ""),
    socialMedia: String(dto.socialMedia ?? "").toLowerCase(),
    username: String(dto.username ?? ""),
    logoUrl: String(dto.logoUrl ?? ""),
    profileType: dto.profileType,
    followers: dto.followers,
    prices: mapPrices(dto.prices),
    ...(Array.isArray(dto.countries) ? { countries: dto.countries.map((country) => typeof country === "string"
        ? { country }
        : { country: country.country, ...(typeof country.percentage === "number" ? { percentage: country.percentage } : {}) }) } : {}),
    ...Object.fromEntries((["communityMusicGenres", "communityThemeTopics", "creatorMusicGenres", "creatorContentFocus"] as const)
        .filter((key) => Array.isArray(dto[key])).map((key) => [key, [...dto[key]!]])),
});

export const mapPublishedOfferDto = (dto: PublishedOfferDto): PublishedOffer => ({
    id: String(dto._id ?? ""),
    title: String(dto.title ?? ""),
    price: toNumber(dto.price),
    prices: mapPrices(dto.parsedPrices),
    storyAndPostDetails: String(dto.storyAndPostDetails ?? ""),

    networksAmount: toNumber(dto.networksAmount),
    combinedFollowers: toNumber(dto.combinedFollowers),
    connectedAccounts: Array.isArray(dto.connectedAccounts)
        ? dto.connectedAccounts.map(mapOfferConnectedAccountDto)
        : [],
});
