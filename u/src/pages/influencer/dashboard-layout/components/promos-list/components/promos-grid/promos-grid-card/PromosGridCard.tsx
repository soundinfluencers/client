import { getSocialMediaIcon } from '../../../../../../../../constants/social-medias';
import type { IPromo } from '@/pages/influencer/promos/types/promos.types';

import './_promos-grid-card.scss';

interface Props {
  promo: IPromo;
};

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
          <p className='promos-grid-card__header-status-text'>{normalizeStatus(promo.statusCampaign)}</p>
          <p className='promos-grid-card__header-status-date'>{promo.createdAt}</p>
        </div>
        {promo.reward && <p className='promos-grid-card__header-status-reward'>{promo.reward}€</p>}
      </div>
      <p className='promos-grid-card__campaign-name'>{promo.campaignName}</p>
    </article>
  );
};

//TODO: Move to utils?
// function dateFormatter(dateString: string) {
//   //DD.MM.YYYY
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();

//   return `${day}.${month}.${year}`;
// }

const normalizeStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return 'New Request';
    case 'distributing':
      return 'Distributing';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}