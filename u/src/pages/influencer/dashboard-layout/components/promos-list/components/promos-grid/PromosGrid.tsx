import { usePromoNavigate } from "@/pages/influencer/dashboard-layout/components/promos-list/hooks/usePromoNavigate.ts";
import { PromosGridCard } from './promos-grid-card/PromosGridCard';
import type { IPromo } from '@/pages/influencer/promos/types/promos.types';

import './_promos-grid.scss';
import { CardSkeleton } from "@/shared/ui/skeletons/card-skeleton.tsx";

interface Props {
  promos: IPromo[];
  isLoading?: boolean;
  isFetching?: boolean;
}

export const PromosGrid = ({ promos, isLoading, isFetching }: Props) => {
  const handleNavigate = usePromoNavigate();

  if (isLoading || isFetching) {
    return (
      <ul className='promos-grid'>
        {Array.from({ length: 12 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </ul>
    )
  }

  return (
    <ul className='promos-grid'>
      {promos.map((promo) => (
        <li
          key={promo.addedAccountsId + promo.campaignId}
          className='promos-grid__item'
          onClick={() => handleNavigate(promo.confirmation, promo.closedStatus, promo.campaignId, promo.addedAccountsId) }
        >
          <PromosGridCard promo={promo} />
        </li>
      ))}
    </ul>
  );
};