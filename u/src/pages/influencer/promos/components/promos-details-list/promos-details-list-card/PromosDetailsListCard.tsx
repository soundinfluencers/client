import './_promos-details-list-card.scss';
import type { IInfluencerPromo } from '../../../../../../types/influencer/promos/promos.types';
import { DetailsRow } from './DetailsRow';
import { ButtonMain, ButtonSecondary } from '../../../../../../components/ui/buttons-fix/ButtonFix';
import type { TSocialMedia } from '../../../../../../types/influencer/form/campaign-result/campaign-result.types';
import { normalizeSocialMedia } from '../../../../../../constants/influencer/form-data/campaign-result/campaign-result.data';
import { getPromoFields, getPromoStatus } from '../../../../../../constants/influencer/promos/promos.data';

interface Props {
  promo: IInfluencerPromo;
  index: number;
  onAccept?: (campaignId: string) => void;
  onDecline?: (campaignId: string) => void;
  onFormOpen?: () => void;
  onMetaChange?: (newMeta: TSocialMedia) => void;
}

/*
  TODO: format dateRequest to readable format
        think about id or unique identifier for copyable fields
*/

export const PromosDetailsListCard: React.FC<Props> = ({
  promo,
  index,
  onAccept,
  onDecline,
  onFormOpen,
  onMetaChange
}) => {
  const status = getPromoStatus(promo);
  const fields = getPromoFields(promo, status);

  const title = status === 'completed' ? 'Completed' : status === 'distributing' ? 'Distributing' : 'New promo';
  const isNew = status === 'new';
  const isDistributing = status === 'distributing';
  const isCompleted = status === 'completed';

  return (
    <article className="promos-details-list-card">
      <div className="promos-details-list-card__header">
        {isNew && <span className='promos-details-list-card__number'>#{index + 1}</span>}
        <span className='promos-details-list-card__status'>{title}</span>
      </div>

      <div className="promos-details-list-card__body">
        <span className="promos-details-list-card__body-header">
          <img src="/2.jpg" alt="2" />
          <span>{promo.campaignName}</span>
        </span>

        <div className="promos-details-list-card__body-details">
          {fields
            .map(field => (
              <DetailsRow
                key={`${field.key}-${field.label}`}
                label={field.label}
                value={
                  field.format
                    ? field.format((promo)[field.key] as number, promo)
                    : (promo)[field.key]?.toString() ?? ''
                }
                copyble={field.copyable}
              />
            ))}
        </div>
      </div>

      {!isCompleted && (
        <div className="promos-details-list-card__actions">
          {isNew && (
            <>
              <ButtonSecondary
                label="Decline"
                onClick={() => onDecline && onDecline(promo.campaignId)}
              />
              <ButtonMain
                label="Accept promo"
                onClick={() => onAccept && onAccept(promo.campaignId)}
              />
            </>
          )}

          {isDistributing && (
            <ButtonMain
              label="Submit results & get paid"
              onClick={() => {
                onFormOpen && onFormOpen();
                onMetaChange && onMetaChange(normalizeSocialMedia(promo.socialMedia));
              }}
            />
          )}
        </div>
      )}

      {/*TODO: Modal for accept/decline new promo */}
    </article>
  );
};