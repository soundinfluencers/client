import { useNavigate } from 'react-router-dom';
import { getSocialMediaIcon } from '../../../../../../../../constants/social-medias';
import type { IPromo } from '@/pages/influencer/promos/types/promos.types';

import './_promos-table-item.scss';

interface Props {
  promo: IPromo;
};

export const PromosTableItem = ({ promo }: Props) => {
  const navigate = useNavigate();

  const handleNavigate = (statusCampaign: string, campaignId?: string, addedAccountsId?: string) => {
    switch (statusCampaign) {
      case 'pending':
        navigate('/influencer/promos/new-promos');
        break;
      case "distributing":
        navigate(`/influencer/promos/distributing`, {
          state: { campaignId, addedAccountsId }
        });
        break;
      case 'completed':
        navigate(`/influencer/promos/completed`, {
          state: { campaignId, addedAccountsId }
        });
        break;
      default:
        navigate('/influencer/promos');
    }
  };

  return (
    <tr className="promos-table-item">
      <td className='promos-table-item__status'>
        <div className="promos-table-item__status-content" onClick={() => handleNavigate(promo.statusCampaign, promo.campaignId, promo.addedAccountsId)}>
          <img
            src={getSocialMediaIcon(promo.socialMedia) || ''}
            alt={promo.socialMedia}
            className="promos-table-item__status-icon"
          />
          {normalizeStatus(promo.statusCampaign)}
        </div>
      </td>
      <td className='promos-table-item__date-post'>
        {promo.createdAt}
      </td>
      <td className='promos-table-item__name'>{promo.campaignName}</td>
      <td className='promos-table-item__reward'>
        {promo.reward && `${promo.reward}€`}
      </td>
    </tr>
  );
};

//div table structure
// <>
//   <div className="promos-table-item__status">
//     <img
//       src={getSocialMediaIcon(promo.socialMedia) || ''}
//       alt={promo.socialMedia}
//       className="promos-table-item__status-icon"
//     />
//     {normalizeStatus(promo.statusCampaign)}
//   </div>
//   <div className="promos-table-item__date-post">
//     {dateFormatter(promo.dateRequest)}
//   </div>
//   <div className="promos-table-item__name">{promo.campaignName}</div>
//   <div className="promos-table-item__reward">
//     {promo.reward ? `${promo.reward}€` : '-'}
//   </div>
// </>


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