import { usePromoNavigate } from "@/pages/influencer/dashboard-layout/components/promos-list/hooks/usePromoNavigate.ts";
import { useDashboardLayoutStore } from "@/pages/influencer/dashboard-layout/store/useDashboardLayoutStore.ts";
import { PromosGridCard } from './promos-grid-card/PromosGridCard';
import { CardSkeleton } from "@/shared/ui/skeletons/card-skeleton.tsx";
import { EmptyPromosList } from "@/pages/influencer/shared/components/empty-promo-list/EmptyPromoList.tsx";
import type { DashboardPromo } from '@/pages/influencer/promos/types/promo-read.types';
import { BundlePromo } from '@/pages/influencer/promos/components/bundle-promo/BundlePromo';
import { dashboardKey, canNavigatePlacement } from '@/pages/influencer/promos/model/promo-read';
// import { SmallLoader } from "@components/ui/small-loader/SmallLoader.tsx";
import { EMPTY_MESSAGE } from "@/pages/influencer/dashboard-layout/data/emptyListMessage.ts";

import './_promos-grid.scss';

interface Props {
  promos: DashboardPromo[];
  isInitialLoading?: boolean;
  isRefreshing?: boolean;
}

export const PromosGrid = ({ promos, isInitialLoading, isRefreshing }: Props) => {
  const handleNavigate = usePromoNavigate();
  const { activePromosFilter } = useDashboardLayoutStore();

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
      <EmptyPromosList
        title={EMPTY_MESSAGE[activePromosFilter].title}
        description={EMPTY_MESSAGE[activePromosFilter].description}
        isDashboard={true}
      />
    );
  }

  return (
    <div className="promos-grid-wrap">
      <ul className={`promos-grid ${isRefreshing ? "promos-grid--dimmed" : ""}`}>
        {promos.map((promo) => (
          <li
            key={dashboardKey(promo)}
            className="promos-grid__item"
            onClick={promo.type === 'standalone' && canNavigatePlacement(promo) ? () => handleNavigate(promo.confirmation, promo.closedStatus, promo.campaignId, promo.addedAccountsId) : undefined}
          >
            {promo.type === 'bundle' ? <BundlePromo promo={promo} /> : <PromosGridCard promo={promo} />}
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
