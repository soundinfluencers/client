import { canUsePlacementAction, hasDisplayValue } from '../../../model/promo-read';
import React from "react";
import { DetailsRow } from './DetailsRow';
import { ButtonMain, ButtonSecondary } from '@components/ui/buttons-fix/ButtonFix.tsx';

import { getTitleForPromoCard } from '../utils/getTitleForPromoCard';
import { getPromoFields } from '../../../data/promos.data';
import type { IPromoDetailsModel, TConfirmationType, TPromoStatus } from '../../../types/promos.types';
// import { normalizeSocialMedia } from '../../../distributing/components/campaign-result-form/data/campaign-result-form-inputs.data';
// import type { TCampaignInfo, TSocialMedia } from '../../../distributing/components/campaign-result-form/types/campaign-result-form.types';

import './_promos-details-list-card.scss';
// import { useUser } from "@/store/get-user";

interface Props {
  promo: IPromoDetailsModel;
  status: TPromoStatus;
  index: number;
  isPending?: boolean;
  actionsDisabled?: boolean;
  pendingAction?: TConfirmationType;
  onAccept?: () => void;
  onDecline?: () => void;
  onSubmitResults?: () => void;
  // onFormOpen?: () => void;
  // onMetaChange?: (newMeta: TSocialMedia) => void;
  // onFormPayloadChange?: (newPayload: TCampaignInfo) => void;
}

export const PromosDetailsListCard: React.FC<Props> = ({
  promo,
  status,
  index,
  isPending,
  actionsDisabled,
  pendingAction,
  onAccept,
  onDecline,
  onSubmitResults,
  // onFormOpen,
  // onMetaChange,
  // onFormPayloadChange,
}) => {
  // const { user } = useUser();
  const fields = getPromoFields(promo, status);

  const canAct = canUsePlacementAction(promo) && !actionsDisabled;
  const isNew = status === 'pending';
  const isDistributing = status === 'distributing';
  const isCompleted = status === 'completed';

  const isAcceptLoading =
    isPending && pendingAction === "accept";

  const isDeclineLoading =
    isPending && pendingAction === "decline";

  return (
    <article className="promos-details-list-card">
      <div className="promos-details-list-card__header">
        {isNew && <span className='promos-details-list-card__number'>#{index + 1}</span>}
        <span className='promos-details-list-card__status'>{getTitleForPromoCard(status)}</span>
      </div>

      <div className="promos-details-list-card__body">
        <span className="promos-details-list-card__body-header">
          <img
            src={(typeof promo.logoUrl === 'string' ? promo.logoUrl.trim() : '') || '/promo-preview.png'}
            alt={promo.username}
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src = '/promo-preview.png';
            }}
            loading={'lazy'}
          />
          <span>{promo.campaignName}</span>
        </span>
        <div className="promos-details-list-card__body-details">
          {fields?.filter(field => hasDisplayValue((promo as unknown as Record<string, unknown>)[field.key]) || field.key === 'reward').map(field => (
              <DetailsRow
                key={`${field.key}-${field.label}`}
                label={field.label}
                value={
                  field.format
                    ? field.format((promo as unknown as Record<string, unknown>)[field.key], promo)
                    : (promo as unknown as Record<string, unknown>)[field.key]?.toString() ?? ''
                }
                copyable={field.copyable}
                linkable={field.linkable}
                icon={field.icon}
              />
            ))}
        </div>
      </div>

      {promo.isPaused === true && <p role="status">Campaign is paused</p>}
      {!isCompleted && (
        <div className="promos-details-list-card__actions">
          {isNew && (
            <>
              <ButtonSecondary
                label={isDeclineLoading ? 'Processing...' : 'Decline'}
                isDisabled={isPending || !canAct}
                onClick={onDecline}
              />
              <ButtonMain
                label={isAcceptLoading ? 'Processing...' : 'Accept promo'}
                isDisabled={isPending || !canAct}
                onClick={onAccept}
              />
            </>
          )}

          {isDistributing && (
            <ButtonMain
              label="Submit results & get paid"
              isDisabled={!canAct}
              onClick={() => {
                if (onSubmitResults) {
                  onSubmitResults();
                }
              }}
            />
          )}
        </div>
      )}
    </article>
  );
};

// onFormOpen && onFormOpen();
// onMetaChange && onMetaChange(normalizeSocialMedia(promo.accountSocialMedia));
// onFormPayloadChange && onFormPayloadChange({
//   campaignId: promo.campaignId,
//   addedAccountsId: promo.addedAccountsId,
//   username: promo.username,
// });

// config for different promo statuses
// const PROMO_CARD_CONFIG = {
//   pending: {
//     showIndex: true,
//     actions: ['accept', 'decline'],
//   },
//   distributing: {
//     showIndex: false,
//     actions: ['submitResults'],
//   },
//   completed: {
//     showIndex: false,
//     actions: [],
//   },
// } as const;
