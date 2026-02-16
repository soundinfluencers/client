import { usePromoNavigate } from "@/pages/influencer/dashboard-layout/components/promos-list/hooks/usePromoNavigate.ts";
import { getSocialMediaIcon } from '@/constants/social-medias.ts';
import {
  normalizePromoStatus
} from "@/pages/influencer/dashboard-layout/components/promos-list/utils/normalizePromoStatus.ts";
import type { IPromo } from '@/pages/influencer/promos/types/promos.types';

import './_promos-table-item.scss';

interface Props {
  promo: IPromo;
}

export const PromosTableItem = ({ promo }: Props) => {
  const handleNavigate = usePromoNavigate();

  return (
    <tr className="promos-table-item">
      <td className='promos-table-item__status'>
        <div
          className="promos-table-item__status-content"
          onClick={() => handleNavigate(promo.confirmation, promo.closedStatus, promo.campaignId, promo.addedAccountsId)}
        >
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