import {
    queryOptions,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import type {
    GetFilteredBundlesRequest,
} from "./bundle.dto";
import {
    getBundleByIdApi,
    getFilteredBundlesApi,
} from "./bundle.api";
import { bundleQueryKeys } from "./bundle.query-keys";
import {
    mapBundleDto,
    mapFilteredBundlesDto,
} from "../model/bundle.mappers";

type UseFilteredBundlesQueryOptions = {
    enabled?: boolean;
};

export const useFilteredBundlesQuery = (
    request: GetFilteredBundlesRequest,
    options: UseFilteredBundlesQueryOptions = {},
) => {
    return useQuery({
        queryKey: bundleQueryKeys.filtered(request),
        queryFn: () => getFilteredBundlesApi(request),
        select: mapFilteredBundlesDto,
        enabled: options.enabled ?? true,
        refetchOnWindowFocus: false,
    });
};

export const getBundleByIdQueryOptions = (bundleId: string) =>
    queryOptions({
        queryKey: bundleQueryKeys.detail(bundleId),
        queryFn: async () => mapBundleDto(
            await getBundleByIdApi(bundleId),
        ),
    });

export const useBundleByIdFetcher = () => {
    const queryClient = useQueryClient();

    return useCallback(
        (bundleId: string) =>
            queryClient.ensureQueryData(
                getBundleByIdQueryOptions(bundleId),
            ),
        [queryClient],
    );
};
