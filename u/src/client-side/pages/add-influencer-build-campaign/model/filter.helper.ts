import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import type { GetFiltersBody } from "@/api/client/creator-campaign-page/filters.api";

type ApiTargetGroup =
    | "communityMusicGenres"
    | "communityThemeTopics"
    | "creatorMusicGenres"
    | "creatorContentFocus";

const flattenSelectedItems = (items: FilterItem[]): FilterItem[] =>
    items.flatMap((item) =>
        item.children?.length ? item.children : [item],
    );

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

const getTargetValues = (
    selected: FilterItem[],
    group: ApiTargetGroup,
): string[] =>
    unique(
        flattenSelectedItems(selected).flatMap((item) => {
            const targets = item.apiTargets?.[group];

            if (targets?.length) return targets;
            if (item.group === group) return [item.id];

            return [];
        }),
    );

const getAllowedProfileTargets = (profileTypes: string[]) => {
    const normalized = profileTypes.map((item) => item.toLowerCase());
    const hasCommunity = normalized.includes("community");
    const hasCreator = normalized.includes("creator");

    return {
        includeCommunity: !(hasCreator && !hasCommunity),
        includeCreator: !(hasCommunity && !hasCreator),
    };
};

export const buildFiltersRequestBody = ({
                                            selected,
                                            budget,
                                            budgetCurrency,
                                        }: {
    selected: FilterItem[];
    budget?: number | null;
    budgetCurrency?: string;
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

    const { includeCommunity, includeCreator } =
        getAllowedProfileTargets(profileTypes);

    const communityMusicGenres = includeCommunity
        ? getTargetValues(selected, "communityMusicGenres")
        : [];
    const communityThemeTopics = includeCommunity
        ? getTargetValues(selected, "communityThemeTopics")
        : [];
    const creatorMusicGenres = includeCreator
        ? getTargetValues(selected, "creatorMusicGenres")
        : [];
    const creatorContentFocus = includeCreator
        ? getTargetValues(selected, "creatorContentFocus")
        : [];

    return {
        socialMedias,
        profileTypes,
        countries,
        communityMusicGenres,
        communityThemeTopics,
        creatorMusicGenres,
        creatorContentFocus,
        ...(budget && budget > 0
            ? {
                budget,
                budgetCurrency: budgetCurrency || "EUR",
            }
            : {}),
    };
};
