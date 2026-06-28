import React from "react";
import { useDebouncedValue } from "@/hooks/client/useDebouncedValue";
import type { PromoAccount } from "@/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.types";
import { useBuildCampaignParams } from "@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params";
import { useCampaignFiltersQuery } from "@/entities/client-side/campaign-creator-page/campaign-filter/api/campaign-filter.queries";
import {
    buildCampaignFiltersRequestBody,
    buildPromoAccountsFiltersBody,
    buildSelectedCampaignFilters,
    getDefaultSocialFilterIds,
    getEmptyCampaignFiltersBody,
    toggleCampaignFilterSelection,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.helpers";
import {
    usePromoAccountsByFiltersQuery,
    useSearchPromoAccountsQuery,
} from "@/entities/client-side/campaign-creator-page/campaign-promo-account/api/promo-account.queries";
import type {
    CampaignFilterItem,
    CampaignFilterSection,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";

const DEFAULT_PROMO_CARDS_LIMIT = 24;

const normalize = (value?: string) => value?.toLowerCase().trim() ?? "";

const isProfileTypeSection = (section: CampaignFilterSection) => {
    return section.id === "profile-type";
};

const COMMUNITY_SECTION_IDS = ["community-music-genres", "community-theme-topics"];
const CREATOR_SECTION_IDS = ["creator-music-genres", "creator-content-focus"];

const isCommunityFilterItem = (item: CampaignFilterItem) => {
    return item.id === "community" || normalize(item.filterName) === "community";
};

const isCreatorFilterItem = (item: CampaignFilterItem) => {
    return item.id === "creator" || normalize(item.filterName) === "creator";
};

const collectFilterIds = (items: CampaignFilterItem[]) => {
    const ids: string[] = [];

    const walk = (list: CampaignFilterItem[]) => {
        list.forEach((item) => {
            ids.push(item.id);

            if (item.children?.length) {
                walk(item.children);
            }
        });
    };

    walk(items);

    return ids;
};
const hasFilters = (section: CampaignFilterSection) => {
    return Array.isArray(section.filters) && section.filters.length > 0;
};
const collectSectionFilterIds = (section: CampaignFilterSection) => {
    return collectFilterIds(section.filters);
};

export const useBuildCampaignView = () => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const ddRef = React.useRef<HTMLDivElement | null>(null);
    const loadMoreRef = React.useRef<HTMLDivElement | null>(null);
    const didInitDefaults = React.useRef(false);

    const [pickedFromSearch, setPickedFromSearch] =
        React.useState<PromoAccount | null>(null);

    const [limit, setLimit] = React.useState(DEFAULT_PROMO_CARDS_LIMIT);
    const [isSmall, setIsSmall] = React.useState(false);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

    const {
        search,
        setSearch,
        selectedBudget,
        setBudget,

        selectedCurrency,
        selectedCurrencyCode,
        setCurrency,
        setCurrencyCode,

        selectedSort,
        selectedSortKey,
        setSort,
        setSortKey,

        view,
        setView,
        filterMethod,
        setMethod,
        filterPanelOpen,
        setPanelOpen,
        selectedFilterIds,
        setSelectedFilterIds,
    } = useBuildCampaignParams();

    const [initialSections, setInitialSections] = React.useState<
        CampaignFilterSection[]
    >([]);

    const bootstrapFiltersQuery = useCampaignFiltersQuery(
        getEmptyCampaignFiltersBody(),
    );

    const bootstrapSections = bootstrapFiltersQuery.data ?? [];

    React.useEffect(() => {
        if (initialSections.length > 0) return;
        if (bootstrapSections.length === 0) return;

        setInitialSections(bootstrapSections);
    }, [bootstrapSections, initialSections.length]);

    const defaultSocialFilterIds = React.useMemo(() => {
        if (!initialSections.length) return [];

        return getDefaultSocialFilterIds(initialSections);
    }, [initialSections]);

    React.useEffect(() => {
        if (!initialSections.length) return;

        if (selectedFilterIds.length > 0) {
            didInitDefaults.current = true;
            return;
        }

        const defaultIds = getDefaultSocialFilterIds(initialSections);

        if (defaultIds.length > 0) {
            setSelectedFilterIds(defaultIds);
        }

        didInitDefaults.current = true;
    }, [initialSections, selectedFilterIds.length, setSelectedFilterIds]);

    const effectiveSelectedFilterIds = React.useMemo(() => {
        if (selectedFilterIds.length > 0) return selectedFilterIds;

        return defaultSocialFilterIds;
    }, [selectedFilterIds, defaultSocialFilterIds]);

    const filtersBody = React.useMemo(() => {
        return buildCampaignFiltersRequestBody({
            sections: initialSections,
            selectedIds: effectiveSelectedFilterIds,
        });
    }, [initialSections, effectiveSelectedFilterIds]);

    const filtersQuery = useCampaignFiltersQuery(filtersBody);
    const sections = filtersQuery.data ?? bootstrapSections;

    const isCommunitySelected = React.useMemo(() => {
        const profileTypeSection = sections.find(isProfileTypeSection);

        if (!profileTypeSection) return false;

        return profileTypeSection.filters.some((item) => {
            return (
                effectiveSelectedFilterIds.includes(item.id) &&
                isCommunityFilterItem(item)
            );
        });
    }, [sections, effectiveSelectedFilterIds]);

    const isCreatorSelected = React.useMemo(() => {
        const profileTypeSection = sections.find(isProfileTypeSection);

        if (!profileTypeSection) return false;

        return profileTypeSection.filters.some((item) => {
            return (
                effectiveSelectedFilterIds.includes(item.id) &&
                isCreatorFilterItem(item)
            );
        });
    }, [sections, effectiveSelectedFilterIds]);

    const hiddenProfileSectionIds = React.useMemo(() => {
        if (isCommunitySelected && !isCreatorSelected) return CREATOR_SECTION_IDS;
        if (isCreatorSelected && !isCommunitySelected) return COMMUNITY_SECTION_IDS;
        return [];
    }, [isCommunitySelected, isCreatorSelected]);

    const hiddenProfileFilterIds = React.useMemo(() => {
        if (!hiddenProfileSectionIds.length) return [];

        return sections
            .filter((section) => hiddenProfileSectionIds.includes(section.id))
            .flatMap(collectSectionFilterIds);
    }, [sections, hiddenProfileSectionIds]);

    const visibleSelectedFilterIds = React.useMemo(() => {
        if (!hiddenProfileFilterIds.length) return effectiveSelectedFilterIds;

        return effectiveSelectedFilterIds.filter(
            (id) => !hiddenProfileFilterIds.includes(id),
        );
    }, [
        effectiveSelectedFilterIds,
        hiddenProfileFilterIds,
    ]);

    const visibleSections = React.useMemo(() => {
        const notEmptySections = sections.filter(hasFilters);

        if (!hiddenProfileSectionIds.length) return notEmptySections;

        return notEmptySections.filter(
            (section) => !hiddenProfileSectionIds.includes(section.id),
        );
    }, [sections, hiddenProfileSectionIds]);

    const selected = React.useMemo(() => {
        if (!visibleSections.length) return [];

        return buildSelectedCampaignFilters(
            visibleSections,
            visibleSelectedFilterIds,
        );
    }, [visibleSections, visibleSelectedFilterIds]);

    const promoBody = React.useMemo(() => {
        return buildPromoAccountsFiltersBody({
            sections: visibleSections,
            selectedIds: visibleSelectedFilterIds,
            budget: selectedBudget,
            budgetCurrency: selectedCurrencyCode,
        });
    }, [
        visibleSections,
        visibleSelectedFilterIds,
        selectedBudget,
        selectedCurrencyCode,
    ]);

    const socialMedias = promoBody.socialMedias;

    const debounced = useDebouncedValue(search, 250);
    const normalizedSearch = debounced.trim();
    const isSearchMode = normalizedSearch.length > 0;

    const hasSections = visibleSections.length > 0;
    const hasSelectedFilters = visibleSelectedFilterIds.length > 0;

    const isFiltersResolved =
        hasSections && (hasSelectedFilters || didInitDefaults.current);

    const promoQuery = usePromoAccountsByFiltersQuery({
        body: promoBody,
        sortBy: selectedSortKey,
        limit,
        enabled: isFiltersResolved && socialMedias.length > 0,
    });

    const searchQuery = useSearchPromoAccountsQuery({
        query: normalizedSearch,
        socialMedias,
        page: 1,
        limit: 20,
        enabled:
            isFiltersResolved &&
            normalizedSearch.length > 0 &&
            socialMedias.length > 0,
    });

    React.useEffect(() => {
        if (!search.trim()) {
            setPickedFromSearch(null);
        }
    }, [search]);

    React.useEffect(() => {
        setIsDropdownOpen(isSearchMode);
    }, [isSearchMode]);

    React.useEffect(() => {
        if (!isDropdownOpen) return;

        const onDown = (e: MouseEvent | TouchEvent) => {
            const el = ddRef.current;
            if (!el) return;

            if (e.target instanceof Node && !el.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", onDown);
        document.addEventListener("touchstart", onDown);

        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("touchstart", onDown);
        };
    }, [isDropdownOpen]);

    const canLoadMore =
        isFiltersResolved &&
        !isSearchMode &&
        (promoQuery.data?.length ?? 0) >= limit &&
        !promoQuery.isFetching;

    React.useEffect(() => {
        if (!canLoadMore) return;

        const el = loadMoreRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;

                if (!entry?.isIntersecting) return;

                setIsLoadingMore(true);
                setLimit((prev) => prev + DEFAULT_PROMO_CARDS_LIMIT);
            },
            { root: null, rootMargin: "100px 0px", threshold: 0 },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [canLoadMore]);

    React.useEffect(() => {
        if (!promoQuery.isFetching) {
            setIsLoadingMore(false);
        }
    }, [promoQuery.isFetching]);

    const displayCards = React.useMemo<PromoAccount[]>(() => {
        if (!search.trim()) {
            return promoQuery.data ?? [];
        }

        return pickedFromSearch ? [pickedFromSearch] : promoQuery.data ?? [];
    }, [search, promoQuery.data, pickedFromSearch]);

    const onPickSearchItem = React.useCallback((item: PromoAccount) => {
        setPickedFromSearch(item);
        setIsDropdownOpen(false);
    }, []);

    const removeSelectedTag = React.useCallback(
        (id: string) => {
            const allSelected = buildSelectedCampaignFilters(
                visibleSections,
                visibleSelectedFilterIds,
            );

            const target = allSelected.find((item) => item.id === id);

            const socialCount = allSelected.filter(
                (item) => item.group === "socialMedia" && !item.children?.length,
            ).length;

            if (target?.group === "socialMedia" && socialCount <= 1) {
                return;
            }

            setSelectedFilterIds(
                visibleSelectedFilterIds.filter((item) => item !== id),
            );

            setLimit(DEFAULT_PROMO_CARDS_LIMIT);
        },
        [
            visibleSections,
            visibleSelectedFilterIds,
            setSelectedFilterIds,
        ],
    );

    const onToggleFilter = React.useCallback(
        ({
             item,
             checked,
             sectionFilters,
         }: {
            item: CampaignFilterItem;
            checked: boolean;
            sectionFilters: CampaignFilterItem[];
        }) => {
            let next = toggleCampaignFilterSelection({
                selectedIds: effectiveSelectedFilterIds,
                item,
                checked,
                sectionFilters,
            });

            const profileTypeSection = sections.find(isProfileTypeSection);

            const nextIsCommunitySelected = profileTypeSection
                ? profileTypeSection.filters.some((filterItem) => {
                    return (
                        next.includes(filterItem.id) &&
                        isCommunityFilterItem(filterItem)
                    );
                })
                : false;

            const nextIsCreatorSelected = profileTypeSection
                ? profileTypeSection.filters.some((filterItem) => {
                    return (
                        next.includes(filterItem.id) &&
                        isCreatorFilterItem(filterItem)
                    );
                })
                : false;

            if (nextIsCommunitySelected !== nextIsCreatorSelected) {
                const sectionIdsToHide = nextIsCommunitySelected
                    ? CREATOR_SECTION_IDS
                    : COMMUNITY_SECTION_IDS;
                const idsToRemove = sections
                    .filter((section) => sectionIdsToHide.includes(section.id))
                    .flatMap(collectSectionFilterIds);

                next = next.filter((id) => !idsToRemove.includes(id));
            }

            const nextSelected = buildSelectedCampaignFilters(sections, next);

            const socialCount = nextSelected.filter(
                (entry) =>
                    entry.group === "socialMedia" && !entry.children?.length,
            ).length;

            if (socialCount === 0) {
                return;
            }

            setSelectedFilterIds(next);
            setLimit(DEFAULT_PROMO_CARDS_LIMIT);
        },
        [effectiveSelectedFilterIds, sections, setSelectedFilterIds],
    );

    const hasCards = (promoQuery.data?.length ?? 0) > 0;

    const isInitialLoading =
        !hasCards &&
        (bootstrapFiltersQuery.isLoading ||
            !isFiltersResolved ||
            promoQuery.isLoading ||
            promoQuery.isFetching);

    const isFetchingMore = hasCards && promoQuery.isFetching && isLoadingMore;
    const isRefetching = hasCards && promoQuery.isFetching && !isLoadingMore;

    const isEmpty =
        isFiltersResolved &&
        !isInitialLoading &&
        !promoQuery.isError &&
        displayCards.length === 0;

    return {
        ddRef,
        loadMoreRef,

        search,
        setSearch,
        selectedBudget,
        setBudget,

        selectedCurrency,
        selectedCurrencyCode,
        setCurrency,
        setCurrencyCode,

        selectedSort,
        selectedSortKey,
        setSort,
        setSortKey,

        view,
        setView,
        filterMethod,
        setMethod,
        filterPanelOpen,
        setPanelOpen,

        selected,
        selectedFilterIds: visibleSelectedFilterIds,
        removeSelectedTag,
        onToggleFilter,

        filtersSections: visibleSections,
        filtersLoading:
            bootstrapFiltersQuery.isLoading || filtersQuery.isFetching,

        isDropdownOpen,
        isSearchMode,

        searchResults: searchQuery.data ?? [],
        searchLoading: searchQuery.isLoading,
        searchFetching: searchQuery.isFetching,
        searchError: searchQuery.isError,
        searchRefetch: searchQuery.refetch,
        onPickSearchItem,

        displayCards,
        promoFetching: promoQuery.isFetching,
        promoError: promoQuery.isError,
        isInitialLoading,
        isFetchingMore,
        isRefetching,
        isEmpty,

        isSmall,
        setIsSmall,
    };
};
