import { useNavigate } from 'react-router-dom';
import { PromosGridCard } from './promos-grid-card/PromosGridCard';

import type { IPromo } from '@/pages/influencer/promos/types/promos.types';

import './_promos-grid.scss';

interface Props {
  promos: IPromo[];
}

export const PromosGrid = ({ promos }: Props) => {
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
    <ul className='promos-grid'>
      {promos.map((promo) => (
        <li
          key={promo.addedAccountsId + promo.campaignId}
          className='promos-grid__item'
          onClick={() => handleNavigate(promo.statusCampaign, promo.campaignId, promo.addedAccountsId)}
        >
          <PromosGridCard promo={promo} />
        </li>
      ))}
    </ul>
  );
};