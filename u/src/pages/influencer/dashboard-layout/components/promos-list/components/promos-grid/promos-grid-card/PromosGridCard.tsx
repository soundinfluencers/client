import type { IPromo } from '../../../../../../../../api/influencer/promos/influencer-promos.api';
import { getSocialMediaIcon } from '../../../../../../../../constants/social-medias';
// import type { IInfluencerPromo } from '../../../../../../../../types/influencer/promos/promos.types';
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
        {/* {promo.reward && <p className='promos-grid-card__header-status-reward'>{promo.reward}€</p>} */}
        {<p className='promos-grid-card__header-status-reward'>599€</p>}
      </div>
      <p className='promos-grid-card__campaign-name'>{promo.campaignName}</p>
    </article>
  );
};

//TODO: Move to utils?
function dateFormatter(dateString: string) {
  //DD.MM.YYYY
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

const normalizeStatus = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'New Request';
    case 'Distributing':
      return 'Distributing';
    case 'Completed':
      return 'Completed';
    default:
      return status;
  }
}