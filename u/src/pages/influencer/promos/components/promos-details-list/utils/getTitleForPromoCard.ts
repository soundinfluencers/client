import type { TPromoStatus } from "@/pages/influencer/promos/types/promos.types.ts";

export const getTitleForPromoCard = (status: TPromoStatus): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'distributing':
      return 'Distributing';
    case 'pending':
    default:
      return 'New promo';
  }
};