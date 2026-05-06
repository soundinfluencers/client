import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import type { GetFiltersBody } from "@/api/client/creator-campaign-page/filters.api";

export const buildFiltersRequestBody = ({
                                            selected,
                                            budget,
                                            budgetCurrency,
                                            filterMethod,
                                        }: {
    selected: FilterItem[];
    budget?: number | null;
    budgetCurrency?: string;
    filterMethod: "and" | "or";
}): GetFiltersBody => {
    const socialMedias = selected
        .filter((item) => item.group === "socialMedia")
        .map((item) => item.id);

    const profileTypes = selected
        .filter((item) => item.group === "profileType")
        .map((item) => item.id);

    const countries = selected
        .filter((item) => item.group === "countries")
        .flatMap((item) =>
            item.children?.length ? item.children.map((child) => child.id) : item.id,
        );

    const musicGenres = selected
        .filter((item) => item.group === "genres")
        .flatMap((item) => {
            const parent = item.id;

            if (item.children?.length) {
                return item.children.map((child) => `${parent} ${child.id}`.trim());
            }

            return [parent];
        });

    const additionalTopics = selected
        .filter((item) => item.group === "addTopics")
        .map((item) => item.id);

    const musicCategories = selected
        .filter((item) => item.group === "musicCategories")
        .map((item) => item.id);

    const entertainmentCategories = selected
        .filter((item) => item.group === "entertainmentCategories")
        .map((item) => item.id);

    return {
        socialMedias,
        profileTypes,
        musicGenres,
        musicGenresFilterMethod: filterMethod,
        countries,
        additionalTopics,
        ...(budget && budget > 0
            ? {
                budget,
                budgetCurrency: budgetCurrency || "EUR",
            }
            : {}),
        musicCategories,
        entertainmentCategories,
    };
};