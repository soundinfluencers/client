import type { TPromoStatus } from "@/types/influencer/promos/promos.types";

export const getTitleForPromoCard = (status: TPromoStatus): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'distributing':
      return 'Distributing';
    case 'pending':
    default:
      return 'New promo';
  };
};