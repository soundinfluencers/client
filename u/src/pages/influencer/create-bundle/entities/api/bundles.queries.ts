import { useQuery } from "@tanstack/react-query";
import { getBundleAccountsApi } from "./bundles.api";
import { bundleAccountsQueryKeys } from "./bundles.query-keys";

export const useBundleAccountsQuery = () => {
  return useQuery({
    queryKey: bundleAccountsQueryKeys.accounts(),
    queryFn: getBundleAccountsApi,
    refetchOnWindowFocus: false,
  });
};
