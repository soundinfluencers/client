import type {
    CampaignFilterItem,
    CampaignFilterMethod,
    CampaignFilterSection,
    PromoAccountsFiltersBody,
} from "../model/campaign-filter.types";

export type CampaignFiltersRequestBody = {
    socialMedias: string[];
    profileTypes: string[];
    musicGenres: string[];
    musicGenresFilterMethod: CampaignFilterMethod;
    countries: string[];
    additionalTopics: string[];
    musicCategories: string[];
    entertainmentCategories: string[];
};

export const getEmptyCampaignFiltersBody = (): CampaignFiltersRequestBody => ({
    socialMedias: [],
    profileTypes: [],
    musicGenres: [],
    musicGenresFilterMethod: "or",
    countries: [],
    additionalTopics: [],
    musicCategories: [],
    entertainmentCategories: [],
});

export const flattenCampaignFilterTree = (
    items: CampaignFilterItem[],
): CampaignFilterItem[] =>
    items.flatMap((item) => [
        item,
        ...(item.children ? flattenCampaignFilterTree(item.children) : []),
    ]);

export const flattenCampaignFilterSections = (
    sections: CampaignFilterSection[],
): CampaignFilterItem[] =>
    sections.flatMap((section) => flattenCampaignFilterTree(section.filters));

export const buildSelectedCampaignFilters = (
    sections: CampaignFilterSection[],
    selectedIds: string[],
): CampaignFilterItem[] => {
    const map = new Map(
        flattenCampaignFilterSections(sections).map((item) => [item.id, item] as const),
    );

    return selectedIds
        .map((id) => map.get(id))
        .filter(Boolean) as CampaignFilterItem[];
};

export const findCampaignFilterParent = (
    filters: CampaignFilterItem[],
    childId: string,
): CampaignFilterItem | null => {
    for (const item of filters) {
        if (item.children?.some((child) => child.id === childId)) {
            return item;
        }

        if (item.children?.length) {
            const nested = findCampaignFilterParent(item.children, childId);
            if (nested) return nested;
        }
    }

    return null;
};

const collectDeepIds = (node: CampaignFilterItem): string[] => [
    node.id,
    ...(node.children?.flatMap((child) => collectDeepIds(child)) ?? []),
];

export const toggleCampaignFilterSelection = ({
                                                  selectedIds,
                                                  item,
                                                  checked,
                                                  sectionFilters,
                                              }: {
    selectedIds: string[];
    item: CampaignFilterItem;
    checked: boolean;
    sectionFilters: CampaignFilterItem[];
}) => {
    const next = new Set(selectedIds);
    const parent = findCampaignFilterParent(sectionFilters, item.id);

    if (checked) {
        if (item.children?.length) {
            collectDeepIds(item).forEach((id) => next.add(id));
        } else if (parent) {
            next.add(parent.id);
            next.add(item.id);
        } else {
            next.add(item.id);
        }

        return Array.from(next);
    }

    if (item.children?.length) {
        collectDeepIds(item).forEach((id) => next.delete(id));
        return Array.from(next);
    }

    next.delete(item.id);

    if (parent) {
        const siblingIds = parent.children?.map((child) => child.id) ?? [];
        const hasSelectedSibling = siblingIds.some(
            (id) => id !== item.id && next.has(id),
        );

        if (!hasSelectedSibling) {
            next.delete(parent.id);
        }
    }

    return Array.from(next);
};

const normalize = (value: string) => value.trim().toLowerCase();

export const getDefaultSocialFilterIds = (
    sections: CampaignFilterSection[],
): string[] => {
    const socialItems = flattenCampaignFilterSections(sections).filter(
        (item) => item.group === "socialMedia" && !item.children?.length,
    );

    const instagram = socialItems.find((item) => {
        const id = normalize(item.id);
        const label = normalize(item.filterName);
        return id === "instagram" || label === "instagram";
    });

    const tiktok = socialItems.find((item) => {
        const id = normalize(item.id);
        const label = normalize(item.filterName);
        return (
            id === "tiktok" ||
            label === "tiktok" ||
            id.includes("tiktok") ||
            label.includes("tiktok")
        );
    });

    return [instagram?.id, tiktok?.id].filter(Boolean) as string[];
};

const findSelectedItemsByGroup = (
    sections: CampaignFilterSection[],
    selectedIds: string[],
    group: string,
): CampaignFilterItem[] => {
    return buildSelectedCampaignFilters(sections, selectedIds).filter(
        (item) => item.group === group,
    );
};

const findSelectedLeafItemsByGroup = (
    sections: CampaignFilterSection[],
    selectedIds: string[],
    group: string,
): CampaignFilterItem[] => {
    return findSelectedItemsByGroup(sections, selectedIds, group).filter(
        (item) => !item.children?.length,
    );
};

export const buildSelectedGenreValues = (
    sections: CampaignFilterSection[],
    selectedIds: string[],
): string[] => {
    const selectedGenreItems = findSelectedItemsByGroup(
        sections,
        selectedIds,
        "genres",
    );

    const selectedGenreLeaves = selectedGenreItems.filter(
        (item) => !item.children?.length,
    );

    return selectedGenreLeaves.map((item) => {
        const parent = findCampaignFilterParent(
            sections.flatMap((section) => section.filters),
            item.id,
        );

        const childValue =
            item.apiValue?.trim() ||
            item.rawId?.trim() ||
            item.filterName.trim();

        if (!parent) {
            return childValue;
        }

        const parentValue =
            parent.rawId?.trim() ||
            parent.apiValue?.trim() ||
            parent.filterName.trim();

        return `${parentValue} ${childValue}`.trim();
    });
};

export const buildCampaignFiltersRequestBody = ({
                                                    sections,
                                                    selectedIds,
                                                    musicGenresFilterMethod,
                                                }: {
    sections: CampaignFilterSection[];
    selectedIds: string[];
    musicGenresFilterMethod: CampaignFilterMethod;
}): CampaignFiltersRequestBody => {
    const socialMedias = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "socialMedia",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    const profileTypes = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "profileType",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    const musicGenres = buildSelectedGenreValues(sections, selectedIds);

    const countries = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "countries",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    const additionalTopics = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "addTopics",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    const musicCategories = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "musicCategories",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    const entertainmentCategories = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "entertainmentCategories",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    return {
        socialMedias,
        profileTypes,
        musicGenres,
        musicGenresFilterMethod,
        countries,
        additionalTopics,
        musicCategories,
        entertainmentCategories,
    };
};

export const buildPromoAccountsFiltersBody = ({
                                                  sections,
                                                  selectedIds,
                                                  musicGenresFilterMethod,
                                                  budget,
                                                  budgetCurrency,
                                              }: {
    sections: CampaignFilterSection[];
    selectedIds: string[];
    musicGenresFilterMethod: CampaignFilterMethod;
    budget: number | null;
    budgetCurrency: string;
}): PromoAccountsFiltersBody => {
    const base = buildCampaignFiltersRequestBody({
        sections,
        selectedIds,
        musicGenresFilterMethod,
    });
    //@ts-ignore
    return {
        ...base,
        ...(budget && budget > 0
            ? {
                budget,
                budgetCurrency,
            }
            : {}),
    };
};