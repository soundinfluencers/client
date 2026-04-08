import React from "react";
import {
    useBuildCampaignFilters,
    useCreateCampaign,
    useFilter,
} from "@/client-side/store";
import { usePromoCardsAndSearch } from "@/client-side/hooks";
import {
    DEFAULT_BUILD_CAMPAIGN_VIEW,
    DEFAULT_PROMO_CARDS_LIMIT
} from "@/client-side/pages/campaign-creator-page/model/campaign-creator.constants.ts";
import type {CampaignListViewMode} from "@/client-side/types/common.ts";
import type {ConnectedAccount} from "@/client-side/types/offers.ts";


export const useBuildCampaignView = () => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const ddRef = React.useRef<HTMLDivElement | null>(null);

    const [search, setSearch] = React.useState("");
    const [pickedFromSearch, setPickedFromSearch] =
        React.useState<ConnectedAccount | null>(null);

    const [limit, setLimit] = React.useState(DEFAULT_PROMO_CARDS_LIMIT);
    const [filterFlag, setFilterFlag] = React.useState(true);
    const [view, setView] =
        React.useState<CampaignListViewMode>(DEFAULT_BUILD_CAMPAIGN_VIEW);
    const [isSmall, setIsSmall] = React.useState(false);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

    const loadMoreRef = React.useRef<HTMLDivElement | null>(null);

    const { selected, removeItem } = useFilter();

    const {
        selectedFilter,
        selectedCurrency,
        selectedBudget,
        setFilter,
        setCurrency,
        setBudget,
        filterMethod,
    } = useBuildCampaignFilters();

    const {
        isSearchMode,
        promoCards,
        promoLoading,
        promoFetching,
        promoError,
        searchResults,
        searchLoading,
        searchFetching,
        searchError,
        searchRefetch,
    } = usePromoCardsAndSearch({
        selected,
        budget: String(selectedBudget),
        currency: selectedCurrency.currency,
        sortBy: selectedFilter.key,
        query: search,
        filterMethod,
        limit,
    });

    const setPending = useCreateCampaign((s) => s.setPending);
    const setPromoCards = useCreateCampaign((s) => s.setPromoCards);

    const canLoadMore =
        !isSearchMode &&
        promoCards.length >= limit &&
        !promoFetching;

    React.useEffect(() => {
        if (!search.trim()) {
            setPickedFromSearch(null);
        }
    }, [search]);

    React.useEffect(() => {
        if (!canLoadMore) return;

        const el = loadMoreRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (!entry?.isIntersecting) return;

                setIsLoadingMore(true);
                setLimit((prev) => prev + DEFAULT_PROMO_CARDS_LIMIT);
            },
            {
                root: null,
                rootMargin: "100px 0px",
                threshold: 0,
            },
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, [canLoadMore]);

    React.useEffect(() => {
        if (!promoFetching) {
            setIsLoadingMore(false);
        }
    }, [promoFetching]);

    React.useEffect(() => {
        setPending("promoCards", promoLoading || promoFetching);
    }, [promoLoading, promoFetching, setPending]);

    const displayCards = React.useMemo<ConnectedAccount[]>(() => {
        if (!search.trim()) {
            return promoCards;
        }

        return pickedFromSearch ? [pickedFromSearch] : promoCards;
    }, [search, promoCards, pickedFromSearch]);

    React.useEffect(() => {
        setPromoCards(displayCards);
    }, [displayCards, setPromoCards]);

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

    const onPickSearchItem = React.useCallback((item: ConnectedAccount) => {
        setPickedFromSearch(item);
        setIsDropdownOpen(false);
    }, []);

    const hasCards = promoCards.length > 0;

    const isInitialLoading = !hasCards && (promoLoading || promoFetching);
    const isFetchingMore = hasCards && promoFetching && isLoadingMore;
    const isRefetching = hasCards && promoFetching && !isLoadingMore;

    return {
        ddRef,
        loadMoreRef,

        search,
        setSearch,
        isDropdownOpen,
        setIsDropdownOpen,

        selected,
        removeItem,

        selectedFilter,
        selectedCurrency,
        selectedBudget,
        setFilter,
        setCurrency,
        setBudget,

        filterFlag,
        setFilterFlag,

        view,
        setView,

        isSmall,
        setIsSmall,

        isSearchMode,
        promoFetching,
        promoError,

        searchResults,
        searchLoading,
        searchFetching,
        searchError,
        searchRefetch,

        displayCards,
        limit,
        canLoadMore,

        isInitialLoading,
        isFetchingMore,
        isRefetching,

        onPickSearchItem,
    };
};