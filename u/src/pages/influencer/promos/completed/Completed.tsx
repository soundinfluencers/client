import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDetailedPromos } from '../hooks/useDetailedPromos';

import { Breadcrumbs, Container, Loader } from '../../../../components';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';

import './_completed.scss';

//TODO: mb add session storage for campaignId and addedAccountsId to persist state on reload
export const Completed: React.FC = () => {
  const { state } = useLocation() as {
    state?: {
      campaignId?: string;
      addedAccountsId?: string;
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { campaignId, addedAccountsId } = state || {};
  console.log(campaignId, addedAccountsId)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
    isFetchingNextPage } = useDetailedPromos({ status: 'close', campaignId, addedAccountsId });

    console.log(data);

  const promos = data?.promos || [];

  console.log('Completed promos:', promos);

  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading promos</div>;
  }
  if (promos.length === 0) {
    return <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>No completed promos found.</div>;
  }

  return (
    <Container className="completed-page">
      <Breadcrumbs />
      <div className="completed-page__wrapper">
        <PromosDetailsList
          data={promos}
          status='completed'
        />

        {!campaignId && !addedAccountsId && (
          <ButtonMain
            label={isFetchingNextPage ? 'Loading...' : 'View more'}
            onClick={() => fetchNextPage()}
            isDisabled={!hasNextPage}
          />
        )}
      </div>
    </Container>
  );
};