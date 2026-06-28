import type {
    CampaignApiTargetGroup,
    CampaignFiltersRequestBody,
    CampaignFilterItem,
    CampaignFilterSection,
    PromoAccountsFiltersBody,
} from "../model/campaign-filter.types";

export const getEmptyCampaignFiltersBody = (): CampaignFiltersRequestBody => ({
    socialMedias: [],
    profileTypes: [],
    countries: [],
    communityMusicGenres: [],
    communityThemeTopics: [],
    creatorMusicGenres: [],
    creatorContentFocus: [],
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

const API_TARGET_GROUPS = [
    "communityMusicGenres",
    "communityThemeTopics",
    "creatorMusicGenres",
    "creatorContentFocus",
] as const satisfies readonly CampaignApiTargetGroup[];

const unique = (values: string[]): string[] => [...new Set(values.filter(Boolean))];

const getSelectedLeafItems = (
    sections: CampaignFilterSection[],
    selectedIds: string[],
): CampaignFilterItem[] =>
    buildSelectedCampaignFilters(sections, selectedIds).filter(
        (item) => !item.children?.length,
    );

const getSelectedApiTargetValues = (
    sections: CampaignFilterSection[],
    selectedIds: string[],
    group: CampaignApiTargetGroup,
): string[] => {
    const selectedItems = getSelectedLeafItems(sections, selectedIds);

    return unique(
        selectedItems.flatMap((item) => {
            const targets = item.apiTargets?.[group];

            if (targets?.length) return targets;

            if (item.group === group) {
                return [item.apiValue || item.rawId || item.filterName];
            }

            return [];
        }),
    );
};

const getAllowedProfileTargets = (profileTypes: string[]) => {
    const normalized = profileTypes.map((item) => normalize(item));
    const hasCommunity = normalized.includes("community");
    const hasCreator = normalized.includes("creator");

    return {
        includeCommunity: !(hasCreator && !hasCommunity),
        includeCreator: !(hasCommunity && !hasCreator),
    };
};

export const buildCampaignFiltersRequestBody = ({
                                                    sections,
                                                    selectedIds,
                                                }: {
    sections: CampaignFilterSection[];
    selectedIds: string[];
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

    const countries = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "countries",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    const { includeCommunity, includeCreator } =
        getAllowedProfileTargets(profileTypes);

    const targetValues = Object.fromEntries(
        API_TARGET_GROUPS.map((group) => [
            group,
            getSelectedApiTargetValues(sections, selectedIds, group),
        ]),
    ) as Record<CampaignApiTargetGroup, string[]>;

    const communityMusicGenres = includeCommunity
        ? targetValues.communityMusicGenres
        : [];
    const communityThemeTopics = includeCommunity
        ? targetValues.communityThemeTopics
        : [];
    const creatorMusicGenres = includeCreator ? targetValues.creatorMusicGenres : [];
    const creatorContentFocus = includeCreator ? targetValues.creatorContentFocus : [];

    return {
        socialMedias,
        profileTypes,
        countries,
        communityMusicGenres,
        communityThemeTopics,
        creatorMusicGenres,
        creatorContentFocus,
    };
};

export const buildPromoAccountsFiltersBody = ({
                                                  sections,
                                                  selectedIds,
                                                  budget,
                                                  budgetCurrency,
                                              }: {
    sections: CampaignFilterSection[];
    selectedIds: string[];
    budget: number | null;
    budgetCurrency: string;
}): PromoAccountsFiltersBody => {
    const base = buildCampaignFiltersRequestBody({
        sections,
        selectedIds,
    });

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
