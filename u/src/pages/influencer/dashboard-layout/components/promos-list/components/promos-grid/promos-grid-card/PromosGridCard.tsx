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
  return (
    <article className='promos-grid-card'>
      <div className='promos-grid-card__header'>
        <div className='promos-grid-card__header-status'>
          <img
            src={getSocialMediaIcon(promo.socialMedia) || ''}
            alt={promo.socialMedia}
            className='promos-grid-card__header-icon'
          />
          <p className='promos-grid-card__header-status-text'>{normalizePromoStatus(promo.confirmation, promo.closedStatus)}</p>
          <p className='promos-grid-card__header-status-date'>{promo.createdAt}</p>
        </div>
        {promo.reward && <p className='promos-grid-card__header-status-reward'>{promo.reward}€</p>}
      </div>
      <p className='promos-grid-card__campaign-name'>{promo.campaignName}</p>
    </article>
  );
};