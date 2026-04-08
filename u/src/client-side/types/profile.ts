import type { ApiResponse, SocialMedia } from "./common";

export type ProfileFilterItem = {
    id: string;
    group: string;
    filterName: string;
    count: number;
    children: string[];
};

export type ProfileFilterGroup = {
    id: string;
    title: string;
    AndOrFlag: {
        method: string;
    }[];
    filters: ProfileFilterItem[];
};

export type GetProfileFiltersResponse = ApiResponse<{
    filterArr: ProfileFilterGroup[];
}>;

export type SocialAccountFilterPayload = {
    socialMedias: SocialMedia[];
    profileTypes: string[];
    musicGenres: string[];
    musicGenresFilterMethod: "and" | "or" | string;
    countries: string[];
    additionalTopics: string[];
    budget: number;
    musicCategories: string[];
    entertainmentCategories: string[];
};

export type SocialAccountSearchPayload = {
    query: string;
    socialMedias: SocialMedia[];
    page: number;
    limit: number;
};