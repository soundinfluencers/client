
import type {
    FilterPromoAccountsBodyDto,
    GetPromoAccountsResponseDto,
    SearchPromoAccountsBodyDto,
    SearchPromoAccountsResponseDto,
} from "./promo-account.dto";
import type { PromoAccount } from "../model/promo-account.types";
import {
    mapPromoAccountDto
} from "@/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.mappers.ts";
import $api from "@/api/api.ts";

export const getPromoAccountsByFilters = async ({
                                                    body,
                                                    sortBy,
                                                    limit,
                                                    page = 1,
                                                }: {
    body: FilterPromoAccountsBodyDto;
    sortBy: string;
    limit: number;
    page?: number;
}): Promise<PromoAccount[]> => {
    const response = await $api.post<GetPromoAccountsResponseDto>(
        "/profile/social-account/filter",
        body,
        {
            params: { sortBy, limit, page },
        },
    );

    const items = response.data?.data?.accounts ?? [];
    return items.map(mapPromoAccountDto);
};

export const searchPromoAccounts = async (
    body: SearchPromoAccountsBodyDto,
): Promise<PromoAccount[]> => {
    const response = await $api.post<SearchPromoAccountsResponseDto>(
        "/profile/social-account/search",
        body,
    );

    const items = response.data?.data?.accounts ?? [];
    console.log(items,'seraacg')
    return items.map(mapPromoAccountDto);
};