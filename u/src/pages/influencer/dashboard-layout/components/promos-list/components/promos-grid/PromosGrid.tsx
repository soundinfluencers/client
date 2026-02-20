import { usePromoNavigate } from "@/pages/influencer/dashboard-layout/components/promos-list/hooks/usePromoNavigate.ts";
import { PromosGridCard } from './promos-grid-card/PromosGridCard';
import type { IPromo } from '@/pages/influencer/promos/types/promos.types';

import './_promos-grid.scss';
import { CardSkeleton } from "@/shared/ui/skeletons/card-skeleton.tsx";
// import { SmallLoader } from "@components/ui/small-loader/SmallLoader.tsx";

interface Props {
  promos: IPromo[];
  isInitialLoading?: boolean;
  isRefreshing?: boolean;
}

export const PromosGrid = ({ promos, isInitialLoading, isRefreshing }: Props) => {
  const handleNavigate = usePromoNavigate();

  if (isInitialLoading) {
    return (
      <ul className='promos-grid'>
        {Array.from({ length: 12 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </ul>
    )
  }

  if (promos.length === 0) {
    return (
      <div style={{ fontSize: 48, textAlign: 'center', padding: 40 }}>
        No promos found.
      </div>
    );
  }

  return (
    <div className="promos-grid-wrap">
      <ul className={`promos-grid ${isRefreshing ? "promos-grid--dimmed" : ""}`}>
        {promos.map((promo) => (
          <li
            key={promo.addedAccountsId + promo.campaignId}
            className="promos-grid__item"
            onClick={() => handleNavigate(promo.confirmation, promo.closedStatus, promo.campaignId, promo.addedAccountsId)}
          >
            <PromosGridCard promo={promo} />
          </li>
        ))}
      </ul>

      {isRefreshing && (
        <div className="promos-grid-overlay" aria-live="polite">
          {/*<div className="promos-grid-overlay__content">*/}
          {/*  <SmallLoader />*/}
          {/*  /!*<div className="spinner" />*!/*/}
          {/*  /!*<span>Updating…</span>*!/*/}
          {/*</div>*/}
        </div>
      )}
    </div>
  );
};

// if(isRefreshing) {
//   return (
//     <ul className='promos-grid'>
//       {Array.from({ length: 12 }).map((_, index) => (
//         <CardSkeleton key={index} />
//       ))}
//     </ul>
//   );
// }