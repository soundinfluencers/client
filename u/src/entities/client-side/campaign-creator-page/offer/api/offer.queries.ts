import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getPublishedOffers } from "./offer.api";

export const usePublishedOffersQuery = (
    platform: string,
    genre: string,
) => {
    return useQuery({
        queryKey: ["publishedOffers", platform, genre] as const,
        queryFn: () => getPublishedOffers(platform, genre),
        staleTime: 30_000,
        retry: (failureCount, error) => {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 400 || status === 403) return false;
            }

            return failureCount < 1;
        },
    });
};