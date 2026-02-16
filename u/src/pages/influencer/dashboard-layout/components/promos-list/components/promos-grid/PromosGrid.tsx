import { usePromoNavigate } from "@/pages/influencer/dashboard-layout/components/promos-list/hooks/usePromoNavigate.ts";
import { PromosGridCard } from './promos-grid-card/PromosGridCard';
import type { IPromo } from '@/pages/influencer/promos/types/promos.types';

import './_promos-grid.scss';

interface Props {
  promos: IPromo[];
}

export const PromosGrid = ({ promos }: Props) => {
  const handleNavigate = usePromoNavigate();

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