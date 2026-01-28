import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDetailedPromos } from '../hooks/useDetailedPromos';

import { Breadcrumbs, Container } from '../../../../components';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';

import './_completed.scss';
//TODO: REVIEW AND FIX THE FUNCTIONALITY AS NEEDED

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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
    isFetchingNextPage } = useDetailedPromos({ status: 'close', campaignId, addedAccountsId });

  const promos = data?.pages.flat() ?? [];

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading promos</div>;
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



// const [promos, setPromos] = useState<any[]>([]);
// const [promosById, setPromosById] = useState<any[]>([]);

// const getPromos = async () => {
//   //api call to get completed promos
//   // const completedPromos = await getInfluencerDetailsPromoByStatus('close', 12, 1);
//   const distrPromosById = await getInfluencerDetailsPromoByStatusByCampaignIdByAddedAccountsId('ongoing', '6960f68ec9ebda34d05270df', '6960f68ec9ebda34d05270db');

//   // console.log(completedPromos);

//   setPromos(distrPromosById);
// };

// useEffect(() => {
//   getPromos();
// }, []);
//campaign - 6960f68ec9ebda34d05270df ongoing
// account - 6960f68ec9ebda34d05270db ongoing

//campaign - 692035745a858bc5e9862cbd close
// account - 692035735a858bc5e9862cb6 close
// const getPromosById = async () => {
//   //api call to get completed promos by campaignId and addedAccountsId
//   const completedPromosById = await getInfluencerDetailsPromoByStatusByCampaignIdByAddedAccountsId('close', '692035745a858bc5e9862cbd', '692035735a858bc5e9862cb6');
//   console.log(completedPromosById);
//   setPromosById(completedPromosById);
// };

// useEffect(() => {
//   getPromosById();
// }, []);

// console.log('Ongoing', promos);
// console.log('Completed', promosById);