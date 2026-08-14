import type {
    BundleFilterBodyDto,
} from "@/entities/client-side/campaign-creator-page/bundle";
import type {
    CampaignCurrencyCode,
    CampaignFiltersRequestBody,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";

type BuildBundleFilterBodyParams = {
    filters: CampaignFiltersRequestBody;
    budget: number | null;
    budgetCurrency: CampaignCurrencyCode;
};

export const buildBundleFilterBody = ({
    filters,
    budget,
    budgetCurrency,
}: BuildBundleFilterBodyParams): BundleFilterBodyDto => {
    const {
        socialMedias,
        profileTypes,
        communityMusicGenres,
        communityThemeTopics,
        creatorMusicGenres,
        creatorContentFocus,
        countries,
    } = filters;

    return {
        ...(socialMedias.length > 0 && {
            socialMedias: [...socialMedias],
        }),
        ...(profileTypes.length > 0 && {
            profileTypes: [...profileTypes],
        }),
        ...(communityMusicGenres.length > 0 && {
            communityMusicGenres: [...communityMusicGenres],
        }),
        ...(communityThemeTopics.length > 0 && {
            communityThemeTopics: [...communityThemeTopics],
        }),
        ...(creatorMusicGenres.length > 0 && {
            creatorMusicGenres: [...creatorMusicGenres],
        }),
        ...(creatorContentFocus.length > 0 && {
            creatorContentFocus: [...creatorContentFocus],
        }),
        ...(countries.length > 0 && {
            countries: [...countries],
        }),
        ...(budget !== null && budget > 0 && { budget }),
        budgetCurrency,
    };
};
