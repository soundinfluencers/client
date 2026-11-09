import { formatPromoReward } from '@/pages/influencer/promos/model/promo-read';
import { getSocialMediaIcon } from '@/constants/social-medias.ts';
import type { IPromo } from '@/pages/influencer/promos/types/promos.types';
import {
  normalizePromoStatus
} from "@/pages/influencer/dashboard-layout/components/promos-list/utils/normalizePromoStatus.ts";

import './_promos-grid-card.scss';

interface Props {
  promo: IPromo;
}

export const PromosGridCard = ({ promo }: Props) => {
  // mb fix reward display for 0 value
  return (
    <article className='promos-grid-card'>
      <div className='promos-grid-card__header'>
        <div className='promos-grid-card__header-status'>
          <img
            src={getSocialMediaIcon(promo.socialMedia as any) || ''}
            alt={promo.socialMedia}
            className='promos-grid-card__header-icon'
          />
          <p className='promos-grid-card__header-status-text'>{normalizePromoStatus(promo.confirmation, promo.closedStatus)}</p>
          <p className='promos-grid-card__header-status-date'>{promo.createdAt}</p>
        </div>
        <p className='promos-grid-card__header-status-reward'>{formatPromoReward(promo.reward)}</p>
      </div>
      <p className='promos-grid-card__campaign-name'>{(promo.campaignName?.length ?? 0) > 40 ? (promo.campaignName!.slice(0, 40).trim().concat('...')) : (promo.campaignName ?? '—')}</p>
    </article>
  );
};
