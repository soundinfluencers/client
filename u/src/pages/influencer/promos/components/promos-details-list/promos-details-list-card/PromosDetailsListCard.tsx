import './_promos-details-list-card.scss';
import type { IInfluencerNewPromo } from '../../../../../../types/influencer/promos.types';
import { DetailsRow } from './DetailsRow';
import { ButtonMain, ButtonSecondary } from '../../../../../../components/ui/buttons/button/Button';
import { normalizeSocialMedia } from '../../../distributing/components/types';

interface Props {
  promo: IInfluencerNewPromo;
  index: number;
  onAccept?: (campaignId: string) => void;
  onDecline?: (campaignId: string) => void;
  onFormOpen?: () => void;
  onMetaChange?: (newMeta: string) => void;
}

/*
  TODO: format dateRequest to readable format
*/

export const PromosDetailsListCard: React.FC<Props> = ({ promo, index, onAccept, onDecline, onFormOpen, onMetaChange }) => {
  const isNew = promo.statusCampaign === 'Pending';

  const title = promo.closedStatus === 'close' ? 'Completed' : promo.closedStatus === 'open' ? 'Distributing' : 'New promo';

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
          <DetailsRow label={promo.socialMedia} value={promo.socialMediaUsername} />
          <DetailsRow label="Client ID" value={promo.client} />
          <DetailsRow label="Videolink" value={promo.videoLink} />
          <DetailsRow label="Description" value={promo.postDescription} copyble={true} />
          <DetailsRow label="Story link" value={promo.storyLink} copyble={true} />
          <DetailsRow label="Story tag" value={promo.storyTag} />
          <DetailsRow label="Date request" value={promo.dateRequest} />
          <DetailsRow label="Additional brief" value={promo.additionalBrief} />
        </div>
      </div>

      <div className="promos-details-list-card__actions">
        {isNew && (
          <>
            <ButtonSecondary
              text='Decline'
              onClick={() => onDecline && onDecline(promo.campaignId)}
              className='btn'
            />
            <ButtonMain
              text='Accept promo'
              onClick={() => onAccept && onAccept(promo.campaignId)}
              className='btn'
            />
          </>
        )}

        <ButtonMain
          text='Submit results & get paid'
          onClick={() => {
            onFormOpen && onFormOpen();
            onMetaChange && onMetaChange(normalizeSocialMedia(promo.socialMedia));
          }}
          className='btn'
        />

        {/* <button
          className='promos-details-list-card__actions-decline'
          onClick={() => console.log('Decline')}
        >
          Decline
        </button>
        <button
          className='promos-details-list-card__actions-accept'
          onClick={() => console.log('Accept promo')}
        >
          Accept promo
        </button> */}
      </div>
    </article>
  );
}