import {usePublishedOffersQuery} from "@/entities/client-side/campaign-creator-page/offer/api/offer.queries.ts";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import {useGenreParam} from "@/features/client-side/campaign-creator-page/select-genre/model/use-genre-param.ts";
import {
    usePlatformParam
} from "@/features/client-side/campaign-creator-page/select-platform/model/use-platform-param.ts";


export const useCampaignCreatorPage = () => {
    const { platformKey, platform, setPlatform } = usePlatformParam();
    const { genre, setGenre } = useGenreParam(platformKey);

    const [params] = useSearchParams();
    const savedContext = useCampaignBuilderStore((s) => s.offerCatalogContext);
    // A confirmed GET catalogue key need not be in the static genre button list.
    const catalogueGenre = savedContext?.platform === platform && params.get("genre") === savedContext.genre
        ? savedContext.genre : genre;
    const query = usePublishedOffersQuery(platform, catalogueGenre);
    const selectedOfferId = useCampaignBuilderStore((s) => s.selectedOfferId);
    const setOfferDisplay = useCampaignBuilderStore((s) => s.actions.setOfferDisplay);
    useEffect(() => {
        const offer = query.data?.find((item) => item.id === selectedOfferId);
        if (offer) setOfferDisplay(offer.id, offer.title, offer.price);
    }, [query.data, selectedOfferId, setOfferDisplay]);

    return {
        selectedPlatformKey: platformKey,
        selectedPlatform: platform,
        setPlatform,
        selectedGenre: genre,
        setSelectedGenre: setGenre,
        offers: query.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        refetch: query.refetch,
    };
};
