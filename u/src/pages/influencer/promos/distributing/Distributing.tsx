import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDetailedPromos } from '../hooks/useDetailedPromos';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';
import { CampaignResultForm } from './components/campaign-result-form/CampaignResultForm';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';
import { Breadcrumbs, Container, Loader } from '../../../../components';
import { isSubmitOpen, isSubmitState, type DistributingNavState, type SubmitResultsNavState } from './components/campaign-result-form/utils/distributing-nav.helper';
import type { IPromoDetailsModel } from '../types/promos.types';

import './_distributing.scss';

//TODO: mb add session storage for campaignId and addedAccountsId to persist state on reload
export const Distributing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isFormOpen = isSubmitOpen(location.hash);

  const isSubmit = isSubmitState(location.state);
  const submitState = isSubmit ? (location.state as SubmitResultsNavState) : null;

  const [pagesIds, setPagesIds] = useState<DistributingNavState>({
    campaignId: undefined,
    addedAccountsId: undefined,
  });

  useEffect(() => {
    if (isSubmit) return;

    const distributingState = (location.state as DistributingNavState | null) ?? null;
    const next = {
      campaignId: distributingState?.campaignId,
      addedAccountsId: distributingState?.addedAccountsId,
    };

    setPagesIds((prev) =>
      prev.campaignId === next.campaignId && prev.addedAccountsId === next.addedAccountsId
        ? prev
        : next
    );
  }, [location.state, isSubmit]);

  const { campaignId, addedAccountsId } = pagesIds;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
    isFetchingNextPage } = useDetailedPromos({ status: 'ongoing', campaignId, addedAccountsId });

  const promos = data?.promos || [];

  useEffect(() => {
    if (isFormOpen && !submitState) {
      navigate({ pathname: location.pathname, hash: '' }, { replace: true, state: { campaignId, addedAccountsId } });
    }
  }, [isFormOpen, submitState, navigate, location.pathname, addedAccountsId, campaignId]);

  const openFormScreen = (promo: IPromoDetailsModel) => {
    const nextState: SubmitResultsNavState = {
      campaignId: promo.campaignId,
      addedAccountsId: promo.addedAccountsId,
      username: promo.username,
      meta: promo.accountSocialMedia,

      from: { campaignId, addedAccountsId },
    };
    navigate({ pathname: location.pathname, hash: 'submit' }, { state: nextState });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading promos</div>;
  }

  if (promos.length === 0) {
    return <p style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>No distributing promos found.</p>
  }

  console.log('Distributing promos:', promos);

  return (
    <Container className='distributing-page'>
      <Breadcrumbs />
      {isFormOpen && submitState ? (
        <CampaignResultForm
          submitState={submitState}
        />
      ) : (
        <div className='distributing-page__wrapper'>
          <PromosDetailsList
            data={promos}
            status='distributing'
            onSubmitResults={openFormScreen}
          />

          {!campaignId && !addedAccountsId && (
            <ButtonMain
              label={isFetchingNextPage ? 'Loading...' : 'View more'}
              onClick={() => fetchNextPage()}
              isDisabled={!hasNextPage}
            />
          )}
        </div>
      )}
    </Container>
  );
};