import { useMemo } from "react";

const MUSIC_NETWORKS = ["soundcloud", "spotify"] as readonly string[];
const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"] as readonly string[];

type GroupedPromos<T> = {
  musicPromos: T[];
  mainPromos: T[];
  otherPromos: T[];
};

export const useGroupPromos = <T extends { socialMedia: string },>(
  promos: T[],
): GroupedPromos<T> => {
  return useMemo(() => {
    const grouped: GroupedPromos<T> = {
      musicPromos: [],
      mainPromos: [],
      otherPromos: [],
    };

    promos.forEach((promo) => {
      const network = promo.socialMedia.toLowerCase();

      if (MUSIC_NETWORKS.includes(network)) {
        grouped.musicPromos.push(promo);
        return;
      }

      if (MAIN_NETWORKS.includes(network)) {
        grouped.mainPromos.push(promo);
        return;
      }

      grouped.otherPromos.push(promo);
    });

    return grouped;
  }, [promos]);
};
