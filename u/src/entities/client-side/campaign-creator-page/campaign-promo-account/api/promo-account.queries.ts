import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    getPromoAccountsByFilters,
    searchPromoAccounts,
} from "@/entities/client-side/campaign-creator-page/campaign-promo-account/api/promo-account.api";
import type {
    PromoAccountsFiltersBody
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";

export const usePromoAccountsByFiltersQuery = ({
                                                   body,
                                                   sortBy,
                                                   limit,
                                                   enabled,
                                               }: {
    body: PromoAccountsFiltersBody;
    sortBy: string;
    limit: number;
    enabled: boolean;
}) => {
    return useQuery({
        queryKey: ["promo-accounts", body, sortBy, limit] as const,
        queryFn: () =>
            getPromoAccountsByFilters({
                body,
                sortBy,
                limit,
            }),
        enabled,
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

export const useSearchPromoAccountsQuery = ({
                                                query,
                                                socialMedias,
                                                page,
                                                limit,
                                                enabled,
                                            }: {
    query: string;
    socialMedias: string[];
    page: number;
    limit: number;
    enabled: boolean;
}) => {
    return useQuery({
        queryKey: [
            "promo-accounts-search",
            query,
            socialMedias,
            page,
            limit,
        ] as const,
        queryFn: () =>
            searchPromoAccounts({
                query,
                socialMedias,
                page,
                limit,
            }),
        enabled,
        staleTime: 15_000,
    });
};