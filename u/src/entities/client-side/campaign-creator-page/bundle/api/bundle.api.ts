import $api from "@/api/api";
import type {
    BundleDto,
    GetBundleByIdResponseDto,
    GetFilteredBundlesDataDto,
    GetFilteredBundlesRequest,
    GetFilteredBundlesResponseDto,
} from "./bundle.dto";

export const getFilteredBundlesApi = async ({
    page,
    limit,
    sortBy,
    body,
}: GetFilteredBundlesRequest): Promise<GetFilteredBundlesDataDto> => {
    const response = await $api.post<GetFilteredBundlesResponseDto>(
        "/profile/bundle/filter",
        body,
        {
            params: {
                page,
                limit,
                sortBy,
            },
        },
    );

    return response.data.data;
};

export const getBundleByIdApi = async (
    bundleId: string,
): Promise<BundleDto> => {
    const response = await $api.get<GetBundleByIdResponseDto>(
        `/profile/bundle/${encodeURIComponent(bundleId)}`,
    );

    return response.data.data.bundle;
};
