import { useEffect, useRef } from "react";
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
import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import type {
    CampaignCurrencyCode,
    CampaignCurrencyOption,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import type {
    CampaignCurrencySwitchResult,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";

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

type UseBuildCampaignParamsOptions = {
    synchronizeCampaignCurrency?: boolean;
};

const CURRENCY_UNAVAILABLE_MESSAGE =
    "This currency is unavailable for one or more selected items.";

const isCampaignCurrencyCode = (
    value: string | null,
): value is CampaignCurrencyCode =>
    value === "EUR" || value === "USD" || value === "GBP";

const reportCurrencySwitchFailure = (
    result: Extract<CampaignCurrencySwitchResult, { ok: false }>,
) => {
    if (import.meta.env.DEV) {
        console.warn("[Campaign currency switch rejected]", {
            targetCurrency: result.targetCurrency,
            missing: result.missing,
        });
    }

    toast.error(CURRENCY_UNAVAILABLE_MESSAGE);
};

const warnCurrencyStateMismatch = ({
    origin,
    queryCurrency,
    requestedCurrency,
    historyAction,
}: {
    origin: "selector" | "popstate" | "hydration" | "reset";
    queryCurrency: CampaignCurrencyCode;
    requestedCurrency: CampaignCurrencyCode;
    historyAction: "push" | "replace" | "none";
}) => {
    if (!import.meta.env.DEV) return;

    const state = useCampaignBuilderStore.getState();

    if (state.selectionCurrency === queryCurrency) return;

    console.warn("[Campaign currency state mismatch]", {
        origin,
        queryCurrency,
        storeCurrency: state.selectionCurrency,
        requestedCurrency,
        resultingCurrency: state.selectionCurrency,
        total: state.totalPrice,
        historyAction,
    });
};

export const useBuildCampaignParams = ({
    synchronizeCampaignCurrency = false,
}: UseBuildCampaignParamsOptions = {}) => {
    const location = useLocation();
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

    const selectionCurrency = useCampaignBuilderStore(
        (state) => state.selectionCurrency,
    );
    const switchCampaignCurrency = useCampaignBuilderStore(
        (state) => state.actions.switchCampaignCurrency,
    );
    const didSynchronizeCurrencyRef = useRef(false);
    const activeCurrencyCode = selectionCurrency ?? params.currency;
    const rawUrlCurrency = new URLSearchParams(location.search).get("currency");

    useEffect(() => {
        if (!synchronizeCampaignCurrency) return;

        const hasInvalidUrlCurrency =
            rawUrlCurrency !== null &&
            !isCampaignCurrencyCode(rawUrlCurrency);

        if (!didSynchronizeCurrencyRef.current) {
            didSynchronizeCurrencyRef.current = true;

            if (isCampaignCurrencyCode(rawUrlCurrency)) {
                if (selectionCurrency !== rawUrlCurrency) {
                    const result = switchCampaignCurrency(rawUrlCurrency);

                    if (!result.ok) {
                        reportCurrencySwitchFailure(result);

                        if (selectionCurrency) {
                            void setParams(
                                { currency: selectionCurrency },
                                { history: "replace" },
                            );
                        }
                    } else {
                        warnCurrencyStateMismatch({
                            origin: "reset",
                            queryCurrency: rawUrlCurrency,
                            requestedCurrency: rawUrlCurrency,
                            historyAction: "none",
                        });
                    }
                }
                return;
            }

            if (!selectionCurrency) {
                const result = switchCampaignCurrency(params.currency);

                if (!result.ok) {
                    reportCurrencySwitchFailure(result);
                }

                if (hasInvalidUrlCurrency) {
                    void setParams(
                        { currency: params.currency },
                        { history: "replace" },
                    );
                }
                return;
            }

            if (
                hasInvalidUrlCurrency ||
                params.currency !== selectionCurrency
            ) {
                void setParams(
                    { currency: selectionCurrency },
                    { history: "replace" },
                ).then(() => {
                    warnCurrencyStateMismatch({
                        origin: "hydration",
                        queryCurrency: selectionCurrency,
                        requestedCurrency: selectionCurrency,
                        historyAction: "replace",
                    });
                });
            }
            return;
        }

        if (hasInvalidUrlCurrency) {
            void setParams(
                { currency: activeCurrencyCode },
                { history: "replace" },
            );
            return;
        }

        if (!selectionCurrency) {
            const result = switchCampaignCurrency(params.currency);

            if (!result.ok) {
                reportCurrencySwitchFailure(result);
            } else {
                warnCurrencyStateMismatch({
                    origin: "reset",
                    queryCurrency: params.currency,
                    requestedCurrency: params.currency,
                    historyAction: "none",
                });
            }
            return;
        }

        if (
            params.currency !== selectionCurrency
        ) {
            const result = switchCampaignCurrency(params.currency);

            if (!result.ok) {
                reportCurrencySwitchFailure(result);
                void setParams(
                    { currency: selectionCurrency },
                    { history: "replace" },
                );
            } else {
                warnCurrencyStateMismatch({
                    origin: "popstate",
                    queryCurrency: params.currency,
                    requestedCurrency: params.currency,
                    historyAction: "none",
                });
            }
        }
    }, [
        activeCurrencyCode,
        params.currency,
        rawUrlCurrency,
        selectionCurrency,
        setParams,
        switchCampaignCurrency,
        synchronizeCampaignCurrency,
    ]);

    const selectedFilterIds = parseFiltersValue(params.filters);

    const selectedCurrency =
        CAMPAIGN_CURRENCY_OPTIONS.find(
            (item) => item.currency === activeCurrencyCode,
        ) ?? CAMPAIGN_CURRENCY_OPTIONS[0];

    const setCurrencyCode = (value: CampaignCurrencyCode) => {
        if (
            selectionCurrency === value &&
            params.currency === value
        ) {
            return;
        }

        const result = switchCampaignCurrency(value);

        if (!result.ok) {
            reportCurrencySwitchFailure(result);
            return;
        }

        void setParams(
            { currency: value },
            { history: "push" },
        ).then(() => {
            warnCurrencyStateMismatch({
                origin: "selector",
                queryCurrency: value,
                requestedCurrency: value,
                historyAction: "push",
            });
        });
    };

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

        selectedCurrencyCode: activeCurrencyCode,
        selectedCurrency,
        setCurrency: (value: CampaignCurrencyOption) =>
            setCurrencyCode(value.currency),
        setCurrencyCode,

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
