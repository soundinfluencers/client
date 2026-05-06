import {usePublishedOffersQuery} from "@/entities/client-side/campaign-creator-page/offer/api/offer.queries.ts";
import {useGenreParam} from "@/features/client-side/campaign-creator-page/select-genre/model/use-genre-param.ts";
import {
    usePlatformParam
} from "@/features/client-side/campaign-creator-page/select-platform/model/use-platform-param.ts";


export const useCampaignCreatorPage = () => {
    const { platformKey, platform, setPlatform } = usePlatformParam();
    const { genre, setGenre } = useGenreParam();

    const query = usePublishedOffersQuery(platform, genre);

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