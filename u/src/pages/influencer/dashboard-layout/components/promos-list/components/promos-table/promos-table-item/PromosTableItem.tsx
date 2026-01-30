import { useNavigate } from 'react-router-dom';
import { getSocialMediaIcon } from '@/constants/social-medias.ts';
import type { IPromo, TClosedStatusType, TConfirmationType } from '@/pages/influencer/promos/types/promos.types';
import {
  normalizePromoStatus
} from "@/pages/influencer/dashboard-layout/components/promos-list/utils/normalizePromoStatus.ts";

import './_promos-table-item.scss';

interface Props {
  promo: IPromo;
}

export const PromosTableItem = ({ promo }: Props) => {
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
    //     navigate(`/influencer/promos/completed`, {
    //       state: { campaignId, addedAccountsId }
    //     });
    //     break;
    //   default:
    //     navigate('/influencer/promos');
    // }
  };

  return (
    <tr className="promos-table-item">
      <td className='promos-table-item__status'>
        <div className="promos-table-item__status-content" onClick={() => handleNavigate(promo.confirmation, promo.closedStatus, promo.campaignId, promo.addedAccountsId)}>
          <img
            src={getSocialMediaIcon(promo.socialMedia) || ''}
            alt={promo.socialMedia}
            className="promos-table-item__status-icon"
          />
          {normalizePromoStatus(promo.confirmation, promo.closedStatus)}
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