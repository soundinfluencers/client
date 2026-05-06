import $api from "@/api/api";

export type GetFiltersBody = {
  socialMedias: string[];
  profileTypes: string[];
  musicGenres: string[];
  musicGenresFilterMethod: "and" | "or";
  countries: string[];
  additionalTopics: string[];
  budget?: number;
  budgetCurrency?: string;
  musicCategories: string[];
  entertainmentCategories: string[];
};

export const getFilters = async (body: GetFiltersBody) => {
  const { data } = await $api.post("/profile/filters", body);
  return data;
};