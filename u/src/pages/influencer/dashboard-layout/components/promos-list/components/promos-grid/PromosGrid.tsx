import { useNavigate } from 'react-router-dom';
// import type { IInfluencerPromo } from '../../../../../../../types/influencer/promos/promos.types';
import { PromosGridCard } from './promos-grid-card/PromosGridCard';

import './_promos-grid.scss';
import type { IPromo } from '../../../../../../../api/influencer/promos/influencer-promos.api';

interface Props {
  promos: IPromo[];
}

export const PromosGrid = ({ promos }: Props) => {
  const navigate = useNavigate();

  const handleNavigate = (confirmation: string) => {
    switch (confirmation) {
      case 'wait':
        navigate('/dashboard/promos/new-promos');
        break;
      case 'accept':
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
    <ul className='promos-grid'>
      {promos.map((promo) => (
        <li
          key={promo.campaignId}
          className='promos-grid__item'
          onClick={() => handleNavigate(promo.confirmation)}
        >
          <PromosGridCard promo={promo} />
        </li>
      ))}
    </ul>
  );
};