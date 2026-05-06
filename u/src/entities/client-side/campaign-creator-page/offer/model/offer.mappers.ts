import type {
    OfferConnectedAccountDto,
    PublishedOfferDto,
} from "../api/offer.types";
import type {
    OfferConnectedAccount,
    PublishedOffer,
} from "../model/offer.types";

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
    followers: dto.followers
});

export const mapPublishedOfferDto = (dto: PublishedOfferDto): PublishedOffer => ({
    id: String(dto._id ?? ""),
    title: String(dto.title ?? ""),
    price: toNumber(dto.price),
    storyAndPostDetails: String(dto.storyAndPostDetails ?? ""),

    networksAmount: toNumber(dto.networksAmount),
    combinedFollowers: toNumber(dto.combinedFollowers),
    connectedAccounts: Array.isArray(dto.connectedAccounts)
        ? dto.connectedAccounts.map(mapOfferConnectedAccountDto)
        : [],
});