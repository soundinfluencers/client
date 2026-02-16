import * as React from "react";

import type { CampaignAddedAccount } from "@/types/store/index.types";

type SortDir = "asc" | "desc" | null;
export function useFollowersSort(networks: CampaignAddedAccount[]) {
  const [followersSort, setFollowersSort] = React.useState<SortDir>(null);

  const toggleFollowersSort = (dir: Exclude<SortDir, null>) => {
    setFollowersSort((prev) => (prev === dir ? null : dir));
  };

  const sortedNetworks = React.useMemo(() => {
    const arr = [...networks];
    if (!followersSort) return arr;

    arr.sort((a, b) => {
      const af = Number(a.followers ?? 0);
      const bf = Number(b.followers ?? 0);
      return followersSort === "asc" ? af - bf : bf - af;
    });

    return arr;
  }, [networks, followersSort]);

  return { followersSort, toggleFollowersSort, sortedNetworks };
}
