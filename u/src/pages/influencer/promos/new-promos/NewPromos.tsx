import './_new-promos.scss';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';

import { NEW_PROMOS_DATA, type IInfluencerNewPromo } from '../../../../types/influencer/promos.types';
import { useMemo, useState } from 'react';
import { Modal } from '../components/modal/Modal';

export const NewPromos = () => {
  const [promos, setPromos] = useState<IInfluencerNewPromo[]>(NEW_PROMOS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const newPromos = useMemo(() => {
    return promos.filter(promo => promo.statusCampaign === 'Pending' && promo.confirmation !== 'decline');
  }, [promos]);

  const handleAcceptPromo = (campaignId: string) => {
    const updatedPromos = promos.map(promo => {
      if (promo.campaignId === campaignId) {
        return { ...promo, statusCampaign: 'Ongoing', closedStatus: 'open' };
      }
      return promo;
    });
    setPromos(updatedPromos);

    //api call to accept promo would, after success open modal
    setTimeout(() => {
      setIsModalOpen(true);
    }, 200);
  };

  const handleDeclinePromo = (campaignId: string) => {
    const updatedPromos = promos.map(promo => {
      if (promo.campaignId === campaignId) {
        return { ...promo, confirmation: 'decline' as const };
      }
      return promo;
    });

    setPromos(updatedPromos);
  };

  return (
    <div className='new-promos'>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className='new-promos__modal-content'>
            <h2 className='new-promos__modal-title'>Promo Accepted!</h2>
            <p className='new-promos__modal-text'>You have successfully accepted the promo. Check your dashboard for more details.</p>
            <button className='new-promos__modal-button' onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </Modal>
      )}
      <div className='new-promos__quantity'>
        <p className='new-promos__label'>New promos</p>
        <span className='new-promos__number'>{newPromos.length}</span>
      </div>
      <PromosDetailsList data={newPromos} onAccept={handleAcceptPromo} onDecline={handleDeclinePromo} />
    </div>
  );
}