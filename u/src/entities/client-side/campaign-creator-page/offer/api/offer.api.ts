import $api from "@/api/api";
import type {
    GetPublishedOffersResponseDto,
} from "./offer.types";
import type { PublishedOffer } from "../model/offer.types";
import { mapPublishedOfferDto } from "../model/offer.mappers";

export const getPublishedOffers = async (
    platform: string,
    genre: string,
): Promise<PublishedOffer[]> => {
    const encodedGenre = encodeURIComponent(genre);

    const response = await $api.get<GetPublishedOffersResponseDto>(
        `/offers/published/${platform}/${encodedGenre}`,
    );

    const items = response.data?.data ?? [];
    return items.map(mapPublishedOfferDto);
};