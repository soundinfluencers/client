import './_new-promos.scss';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';

// import { NEW_PROMOS_DATA, type IInfluencerPromo } from '../../../../types/influencer/promos/promos.types';
import { useState } from 'react';
import { Modal } from '../../../../components/ui/modal-fix/Modal';
import { Breadcrumbs, Container } from '../../../../components';
import successIcon from '@/assets/icons/success-icon.svg';
import { ButtonMain } from '../../../../components/ui/buttons-fix/ButtonFix';
import { useInfluencerNewPromos } from './hooks/useInfluencerNewPromos';
import { useConfirmInfluencerPromo } from './hooks/useConfirmInfluencerPromo';

export const NewPromos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: promos = [], isLoading, error: fetchError } = useInfluencerNewPromos();
  const { mutate: confirmPromo, isPending, error: confirmError, variables } = useConfirmInfluencerPromo();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchError) {
    return <div>Error loading promos</div>;
  }

  return (
    <Container className='new-promos'>
      <Breadcrumbs />
      <div className='new-promos__quantity'>
        <p className='new-promos__label'>New promos</p>
        <span className='new-promos__number'>{promos.length}</span>
      </div>
      <PromosDetailsList
        data={promos}
        status='pending'
        onAccept={(payload) => {
          confirmPromo(payload, {
            onSuccess: () => setIsModalOpen(true),
          });
        }}
        onDecline={(payload) => {
          confirmPromo(payload);
        }}
        mutationState={{
          isPending,
          variables,
        }}
      />

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