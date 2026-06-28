import $api from "@/api/api";
import { mapCampaignFilterSectionsToLegacyDto } from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.mappers";

export type GetFiltersBody = {
  socialMedias: string[];
  profileTypes: string[];
  countries: string[];
  communityMusicGenres: string[];
  communityThemeTopics: string[];
  creatorMusicGenres: string[];
  creatorContentFocus: string[];
  budget?: number;
  budgetCurrency?: string;
};

export const getFilters = async (body?: GetFiltersBody) => {
  const { data } = await $api.post("/profile/filters", body ?? {});
  const filterArr = data?.data?.filterArr ?? [];

  return {
    ...data,
    data: {
      ...data?.data,
      filterArr: mapCampaignFilterSectionsToLegacyDto(filterArr),
    },
  };
};
