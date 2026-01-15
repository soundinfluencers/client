import './_promos-details-list.scss';
import type React from 'react';
import type { IInfluencerPromo } from '../../../../../types/influencer/promos/promos.types';
import { PromosDetailsListCard } from './promos-details-list-card/PromosDetailsListCard';
import type { TSocialMedia } from '../../../../../types/influencer/form/campaign-result/campaign-result.types';

interface Props {
  data: IInfluencerPromo[];
  onAccept?: (campaignId: string) => void;
  onDecline?: (campaignId: string) => void;
  onFormOpen?: () => void;
  onMetaChange?: (newMeta: TSocialMedia) => void;
}

export const PromosDetailsList: React.FC<Props> = ({ data, onAccept, onDecline, onFormOpen, onMetaChange }) => {
  return (
    <ul className="promos-details-list">
      {data.map((promo, index) => (
        <li key={promo.campaignId} className="promos-details-list__item">
          <PromosDetailsListCard
            promo={promo}
            index={index}
            onAccept={onAccept}
            onDecline={onDecline}
            onFormOpen={onFormOpen}
            onMetaChange={onMetaChange}
          />
        </li>
      ))}
    </ul>
  );
};