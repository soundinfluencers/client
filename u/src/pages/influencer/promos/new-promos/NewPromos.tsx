import './_new-promos.scss';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';

import { NEW_PROMOS_DATA, type IInfluencerPromo } from '../../../../types/influencer/promos/promos.types';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../../../components/ui/modal-fix/Modal';
import { Breadcrumbs, Container } from '../../../../components';
import { getInfluencerNewPromo } from '../../../../api/influencer/promos/influencer-promos.api';
import successIcon from '@/assets/icons/success-icon.svg';
import { ButtonMain } from '../../../../components/ui/buttons-fix/ButtonFix';

//TODO: REVIEW AND FIX THE FUNCTIONALITY AS NEEDED
export const NewPromos = () => {
  const [promos, setPromos] = useState<IInfluencerPromo[]>(NEW_PROMOS_DATA);
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

  const [fetchData, setFetchData] = useState<any[]>([]); //for api data

  const fetchApiData = async () => {
    const data = await getInfluencerNewPromo();
    console.log(data);
    setFetchData(data);
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  console.log(fetchData);

  return (
    <Container className='new-promos'>
      <Breadcrumbs />
      <div className='new-promos__quantity'>
        <p className='new-promos__label'>New promos</p>
        <span className='new-promos__number'>{newPromos.length}</span>
      </div>
      <PromosDetailsList data={newPromos} onAccept={handleAcceptPromo} onDecline={handleDeclinePromo} />

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className='new-promos__modal'>
            <img className='new-promos__modal-image' src={successIcon} alt="Success" />
            <div className='new-promos__modal-header'>
              <h2 className='new-promos__modal-title'>Congratulation!</h2>
              <div className='new-promos__modal-description'>
                <p className='new-promos__modal-subtitle'>The promo is now marked as distributing - you can see it in the home page.</p>
                <p className='new-promos__modal-text'>Please proceed from there to complete the content distribution process.</p>
              </div>
            </div>
              <ButtonMain label='Ok' onClick={() => setIsModalOpen(false)} />
          </div>
        </Modal>
      )}
    </Container>
  );
}