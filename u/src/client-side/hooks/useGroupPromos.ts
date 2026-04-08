import { useMemo } from "react";
import type {ConnectedAccount} from "@/client-side/types/offers.ts";

const MUSIC_NETWORKS = ["soundcloud", "spotify"] as const;
const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"] as const;

type GroupedPromos = {
  musicPromos: ConnectedAccount[];
  mainPromos: ConnectedAccount[];
  otherPromos: ConnectedAccount[];
};

export const useGroupPromos = (
  promos: ConnectedAccount[],
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
