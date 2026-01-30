import { useNavigate } from 'react-router-dom';
import { PromosGridCard } from './promos-grid-card/PromosGridCard';
import type { IPromo, TClosedStatusType, TConfirmationType } from '@/pages/influencer/promos/types/promos.types';

import './_promos-grid.scss';

interface Props {
  promos: IPromo[];
}

export const PromosGrid = ({ promos }: Props) => {
  const navigate = useNavigate();

  const handleNavigate = (confirmation: TConfirmationType, closedStatus: TClosedStatusType, campaignId?: string, addedAccountsId?: string) => {
    if (confirmation === 'wait' && closedStatus === "wait") {
      return navigate('/influencer/promos/new-promos');
    } else if (confirmation === 'accept' && closedStatus === 'wait') {
      return navigate(`/influencer/promos/distributing`, {
        state: { campaignId, addedAccountsId }
      });
    } else if (closedStatus === 'close') {
      return navigate(`/influencer/promos/completed`, {
        state: { campaignId, addedAccountsId }
      });
    }

    return navigate('/influencer/promos');
    // switch (statusCampaign) {
    //   case 'under_review':
    //     navigate('/influencer/promos/new-promos');
    //     break;
    //   case "distributing":
    //     navigate(`/influencer/promos/distributing`, {
    //       state: { campaignId, addedAccountsId }
    //     });
    //     break;
    //   case 'completed':
    //     console.log('navigate with:', campaignId, addedAccountsId);
    //     navigate(`/influencer/promos/completed`, {
    //       state: { campaignId, addedAccountsId }
    //     });
    //     break;
    //   default:
    //     navigate('/influencer/promos');
    // }
  };

  return (
    <ul className='promos-grid'>
      {promos.map((promo) => (
        <li
          key={promo.addedAccountsId + promo.campaignId}
          className='promos-grid__item'
          onClick={() => handleNavigate(promo.confirmation, promo.closedStatus, promo.campaignId, promo.addedAccountsId)}
        >
          <PromosGridCard promo={promo} />
        </li>
      ))}
    </ul>
  );
};

// const handleNavigate = (statusCampaign: string, campaignId?: string, addedAccountsId?: string) => {
//   switch (statusCampaign) {
//     case 'under_review':
//       navigate('/influencer/promos/new-promos');
//       break;
//     case "distributing":
//       navigate(`/influencer/promos/distributing`, {
//         state: { campaignId, addedAccountsId }
//       });
//       break;
//     case 'completed':
//       navigate(`/influencer/promos/completed`, {
//         state: { campaignId, addedAccountsId }
//       });
//       break;
//     default:
//       navigate('/influencer/promos');
//   }
// };