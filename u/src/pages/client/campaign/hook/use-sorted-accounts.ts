import React from "react";
import type { CampaignAddedAccount } from "@/types/store/index.types";
import type { SortState } from "../components/tables/sorting/types";
import { toNumber } from "../components/tables/sorting/utils";

export function useSortedAccounts(
  accounts: CampaignAddedAccount[],
  sort: SortState,
) {
  return React.useMemo(() => {
    const arr = [...accounts];

    if (!sort.key || !sort.dir) return arr;

    arr.sort((a, b) => {
      const field = sort.key === "likes" ? "like" : sort.key;

      const av = toNumber((a as any)[field || 0]);
      const bv = toNumber((b as any)[field || 0]);

      return sort.dir === "asc" ? av - bv : bv - av;
    });

    return arr;
  }, [accounts, sort.key, sort.dir]);
}
