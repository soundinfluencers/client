import { useNavigate } from 'react-router-dom';
import { getSocialMediaIcon } from '../../../../../../../../constants/social-medias';
// import type { IInfluencerPromo } from '../../../../../../../../types/influencer/promos/promos.types';
import './_promos-table-item.scss';
import type { IPromo } from '../../../../../../../../api/influencer/promos/influencer-promos.api';

interface Props {
  promo: IPromo;
};

export const PromosTableItem = ({ promo }: Props) => {
  const navigate = useNavigate();

  const handleNavigate = (status: string) => {
    switch (status) {
      case 'Pending':
        navigate('/dashboard/promos/new-promos');
        break;
      case 'Distributing':
        navigate('/dashboard/promos/distributing');
        break;
      case 'Completed':
        navigate('/dashboard/promos/completed');
        break;
      default:
        navigate('/dashboard/promos');
    }
  };

  return (
    <tr className="promos-table-item">
      <td className='promos-table-item__status'>
        <div className="promos-table-item__status-content" onClick={() => handleNavigate(promo.statusCampaign)}>
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
        {/* {promo.reward ? `${promo.reward}€` : ''} */}
        {`599€`}
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