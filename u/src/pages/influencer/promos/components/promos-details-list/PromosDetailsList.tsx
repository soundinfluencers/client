import type { DetailedPromo, NewBundlePromo, PlacementPromo } from '../../types/promo-read.types';
import { canUsePlacementAction, detailKey, isBundlePromo, isPromoPlatform, hasBundleLinks } from '../../model/promo-read';
import { BundlePromo, BundleUnavailable } from '../bundle-promo/BundlePromo';
import { BUNDLES_AVAILABLE } from '@/shared/config/bundle-availability';
import { BundleMemberResultsEntry } from '../bundle-promo/BundleMemberResultsEntry';
import type { SubmitResultsNavState } from '../../distributing/components/campaign-result-form/utils/distributing-nav.helper';
import type React from 'react';
import { PromosDetailsListCard } from './promos-details-list-card/PromosDetailsListCard';
import type { IPromoDetailsModel, TAcceptDeclineRequestPromoModel, TPromoStatus } from '../../types/promos.types';

import './_promos-details-list.scss';

interface Props {
  data: DetailedPromo[];
  status: TPromoStatus;
  mutationState?: {
    isPending: boolean;
    variables: TAcceptDeclineRequestPromoModel | undefined;
  };
  mutationStateFor?: (promo: PlacementPromo) => { isPending: boolean; variables: TAcceptDeclineRequestPromoModel | undefined };
  onAccept?: (payload: TAcceptDeclineRequestPromoModel) => void;
  onDecline?: (payload: TAcceptDeclineRequestPromoModel) => void;
  onSubmitResults?: (promo: IPromoDetailsModel) => void;
  isActionBlocked?: (promo: PlacementPromo) => boolean;
  renderActionStatus?: (promo: PlacementPromo) => React.ReactNode;
  onBundleDecision?: (promo: NewBundlePromo, response: 'accept' | 'decline') => void;
  bundleActionState?: (promo: NewBundlePromo) => { blocked: boolean; feedback: React.ReactNode };
  bundleContexts?: readonly NewBundlePromo[];
  onBundleMemberResults?: (state: SubmitResultsNavState) => void;
}

export const PromosDetailsList: React.FC<Props> = ({
  data,
  status,
  mutationState,
  mutationStateFor,
  onAccept,
  onDecline,
  onSubmitResults,
  isActionBlocked, renderActionStatus, onBundleDecision, bundleActionState, bundleContexts, onBundleMemberResults,
}) => {

  const handleAccept = (promo: IPromoDetailsModel) => {
    if (!canUsePlacementAction(promo) || isActionBlocked?.(promo)) return;
    onAccept?.({
      campaignId: promo.campaignId,
      addedAccountsId: promo.addedAccountsId,
      username: promo.username,
      campaignResponse: 'accept'
    });
  };

  const handleDecline = (promo: IPromoDetailsModel) => {
    if (!canUsePlacementAction(promo) || isActionBlocked?.(promo)) return;
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
        if (isBundlePromo(promo)) return <li key={detailKey(promo)} className="promos-details-list__item"><BundlePromo promo={promo} actionState={bundleActionState?.(promo)} onDecision={onBundleDecision ? response => onBundleDecision(promo, response) : undefined} /></li>;
        if (hasBundleLinks(promo)) return <li key={detailKey(promo)}>{BUNDLES_AVAILABLE && status === 'distributing' && onBundleMemberResults
          ? <BundleMemberResultsEntry member={promo} group={bundleContexts?.find(group => group.campaignId === promo.campaignId && group.campaignBundleId === promo.campaignBundleId)} onOpen={onBundleMemberResults} />
          : <BundleUnavailable />}</li>;
        const cardMutation = mutationStateFor?.(promo) ?? mutationState;
        const isThisCardPending = cardMutation?.isPending && cardMutation.variables?.campaignId === promo.campaignId && cardMutation.variables?.addedAccountsId === promo.addedAccountsId;

        return (
          <li key={detailKey(promo)} className="promos-details-list__item">
            <PromosDetailsListCard
              promo={promo}
              status={status}
              index={index}
              isPending={isThisCardPending}
              actionsDisabled={isActionBlocked?.(promo)}
              pendingAction={cardMutation?.variables?.campaignResponse}
              onAccept={() => handleAccept(promo)}
              onDecline={() => handleDecline(promo)}
              onSubmitResults={() => canUsePlacementAction(promo) && isPromoPlatform(promo.accountSocialMedia) && !!promo.username && onSubmitResults && onSubmitResults(promo)}
            />
            {renderActionStatus?.(promo)}
          </li>
        )
      })}
    </ul>
  );
};
