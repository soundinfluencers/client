import type React from 'react';
import { PromosDetailsListCard } from './promos-details-list-card/PromosDetailsListCard';
import type { IPromoDetailsModel, TAcceptDeclineRequestPromoModel, TPromoStatus } from '../../types/promos.types';
// import type { TCampaignInfo, TSocialMedia } from '../../distributing/components/campaign-result-form/types/campaign-result-form.types';

import './_promos-details-list.scss';

interface Props {
  data: IPromoDetailsModel[];
  status: TPromoStatus;
  mutationState?: {
    isPending: boolean;
    variables: TAcceptDeclineRequestPromoModel | undefined;
  };
  onAccept?: (payload: TAcceptDeclineRequestPromoModel) => void;
  onDecline?: (payload: TAcceptDeclineRequestPromoModel) => void;
  onSubmitResults?: (promo: IPromoDetailsModel) => void;
  // onFormOpen?: () => void;
  // onMetaChange?: (newMeta: TSocialMedia) => void;
  // onFormPayloadChange?: (newPayload: TCampaignInfo) => void;
};

export const PromosDetailsList: React.FC<Props> = ({
  data,
  status,
  mutationState,
  onAccept,
  onDecline,
  onSubmitResults,
  // onFormOpen,
  // onMetaChange,
  // onFormPayloadChange
}) => {

  const handleAccept = (promo: IPromoDetailsModel) => {
    onAccept?.({
      campaignId: promo.campaignId,
      addedAccountsId: promo.addedAccountsId,
      username: promo.username,
      campaignResponse: 'accept'
    });
  };

  const handleDecline = (promo: IPromoDetailsModel) => {
    onDecline?.({
      campaignId: promo.campaignId,
      addedAccountsId: promo.addedAccountsId,
      username: promo.username,
      campaignResponse: 'decline'
    });
  };

  return (
    <ul className="promos-details-list">
      {data.map((promo, index) => {
        const isThisCardPending = mutationState?.isPending && mutationState.variables?.campaignId === promo.campaignId;

        return (
          <li key={promo.campaignId} className="promos-details-list__item">
            <PromosDetailsListCard
              promo={promo}
              status={status}
              index={index}
              isPending={isThisCardPending}
              pendingAction={mutationState?.variables?.campaignResponse}
              onAccept={() => handleAccept(promo)}
              onDecline={() => handleDecline(promo)}
              onSubmitResults={() => onSubmitResults && onSubmitResults(promo)}
            // onFormOpen={onFormOpen}
            // onMetaChange={onMetaChange}
            // onFormPayloadChange={onFormPayloadChange}
            />
          </li>
        )
      })}
    </ul>
  );
};