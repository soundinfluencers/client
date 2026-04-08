import type { CurrencyOption, SortFilterOption } from "./types";

export const DEFAULT_FILTER_METHOD = "and";

export const DEFAULT_FILTER: SortFilterOption = {
    key: "bestMatch",
    name: "Best Match",
};

export const DEFAULT_CURRENCY: CurrencyOption = {
    key: "€",
    currency: "EUR",
};

export const DEFAULT_BUDGET = 0;