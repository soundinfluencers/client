import {
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
    useQueryStates,
} from "nuqs";
import {
    CAMPAIGN_CURRENCY_OPTIONS,
    CAMPAIGN_SORT_OPTIONS,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/build-campaign-params.constants";

const VIEW_VALUES = ["grid", "table"] as const;
const METHOD_VALUES = ["and", "or"] as const;
const CURRENCY_VALUES = ["EUR", "USD", "GBP"] as const;
const SORT_VALUES = [
    "bestMatch",
    "lowestPrice",
    "highestPrice",
    "highestFollowers",
] as const;
const PANEL_VALUES = ["open", "closed"] as const;

const parseFiltersValue = (value: string | null): string[] => {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === "string")
            : [];
    } catch {
        return [];
    }
};

const serializeFiltersValue = (value: string[]) => {
    return value.length ? JSON.stringify(value) : null;
};

export const useBuildCampaignParams = () => {
    const [params, setParams] = useQueryStates(
        {
            q: parseAsString.withDefault(""),
            budget: parseAsInteger,
            currency: parseAsStringLiteral(CURRENCY_VALUES).withDefault("EUR"),
            sort: parseAsStringLiteral(SORT_VALUES).withDefault("bestMatch"),
            view: parseAsStringLiteral(VIEW_VALUES).withDefault("grid"),
            method: parseAsStringLiteral(METHOD_VALUES).withDefault("and"),
            panel: parseAsStringLiteral(PANEL_VALUES).withDefault("open"),
            filters: parseAsString.withDefault(""),
        },
        {
            shallow: false,
            clearOnDefault: true,
        },
    );

    const selectedFilterIds = parseFiltersValue(params.filters);

    const selectedCurrency =
        CAMPAIGN_CURRENCY_OPTIONS.find(
            (item) => item.currency === params.currency,
        ) ?? CAMPAIGN_CURRENCY_OPTIONS[0];

    const selectedSort =
        CAMPAIGN_SORT_OPTIONS.find((item) => item.key === params.sort) ??
        CAMPAIGN_SORT_OPTIONS[0];

    return {
        search: params.q,
        setSearch: (value: string) => setParams({ q: value || null }),

        selectedBudget: params.budget ?? null,
        setBudget: (value: number | null) =>
            setParams({
                budget: value && value > 0 ? value : null,
            }),

        selectedCurrencyCode: params.currency,
        selectedCurrency,
        setCurrency: (value: { key: string; currency: "EUR" | "USD" | "GBP" }) =>
            setParams({ currency: value.currency }),
        setCurrencyCode: (value: "EUR" | "USD" | "GBP") =>
            setParams({ currency: value }),

        selectedSortKey: params.sort,
        selectedSort,
        setSort: (value: { key: typeof params.sort; name: string }) =>
            setParams({ sort: value.key }),
        setSortKey: (value: typeof params.sort) =>
            setParams({ sort: value }),

        view: params.view,
        setView: (value: "grid" | "table") => setParams({ view: value }),

        filterMethod: params.method,
        setMethod: (value: "and" | "or") => setParams({ method: value }),

        filterPanelOpen: params.panel === "open",
        setPanelOpen: (value: boolean) =>
            setParams({ panel: value ? "open" : "closed" }),

        selectedFilterIds,
        setSelectedFilterIds: (ids: string[]) =>
            setParams({ filters: serializeFiltersValue(ids) }),
    };
};