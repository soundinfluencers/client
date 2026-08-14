import { PromosDetailsListCard } from './promos-details-list-card/PromosDetailsListCard';
import type {
  TAcceptDeclineRequestPromoModel,
  TPromoDetailsCardModel,
  TPromoStatus,
} from '../../types/promos.types';

import './_promos-details-list.scss';

interface Props<TPromo extends TPromoDetailsCardModel> {
  data: TPromo[];
  status: TPromoStatus;
  mutationState?: {
    isPending: boolean;
    variables: TAcceptDeclineRequestPromoModel | undefined;
  };
  onAccept?: (payload: TAcceptDeclineRequestPromoModel) => void;
  onDecline?: (payload: TAcceptDeclineRequestPromoModel) => void;
  onSubmitResults?: (promo: TPromo) => void;
}

export const PromosDetailsList = <TPromo extends TPromoDetailsCardModel,>({
  data,
  status,
  mutationState,
  onAccept,
  onDecline,
  onSubmitResults,
}: Props<TPromo>) => {

  const handleAccept = (promo: TPromo) => {
    onAccept?.({
      campaignId: promo.campaignId,
      addedAccountsId: promo.addedAccountsId,
      username: promo.username,
      campaignResponse: 'accept'
    });
  };

  const handleDecline = (promo: TPromo) => {
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
          <li key={`${promo.campaignId}:${promo.addedAccountsId}`} className="promos-details-list__item">
            <PromosDetailsListCard
              promo={promo}
              status={status}
              index={index}
              isPending={isThisCardPending}
              pendingAction={mutationState?.variables?.campaignResponse}
              onAccept={() => handleAccept(promo)}
              onDecline={() => handleDecline(promo)}
              onSubmitResults={() => onSubmitResults && onSubmitResults(promo)}
            />
          </li>
        )
      })}
    </ul>
  );
};
