import { useMemo } from "react";
import type { CampaignAddedAccount } from "@/types/store/index.types";

const MUSIC_NETWORKS = ["soundcloud", "spotify"] as const;
const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"] as const;

type GroupedPromos = {
  musicPromos: CampaignAddedAccount[];
  mainPromos: CampaignAddedAccount[];
  otherPromos: CampaignAddedAccount[];
};

export const useGroupPromos = (
  promos: CampaignAddedAccount[],
): GroupedPromos => {
  return useMemo(() => {
    const grouped: GroupedPromos = {
      musicPromos: [],
      mainPromos: [],
      otherPromos: [],
    };

    promos.forEach((promo) => {
      const network = promo.socialMedia.toLowerCase();

      if (MUSIC_NETWORKS.includes(network as any)) {
        grouped.musicPromos.push(promo);
        return;
      }

      if (MAIN_NETWORKS.includes(network as any)) {
        grouped.mainPromos.push(promo);
        return;
      }

      grouped.otherPromos.push(promo);
    });

    return grouped;
  }, [promos]);
};
