import './_completed.scss';
import { Breadcrumbs, Container } from '../../../../components';
import { NEW_PROMOS_DATA, type IInfluencerPromo } from '../../../../types/influencer/promos/promos.types';
import { useMemo, useState } from 'react';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';

//TODO: REVIEW AND FIX THE FUNCTIONALITY AS NEEDED
export const Completed = () => {
  const [promos, setPromos] = useState<IInfluencerPromo[]>(NEW_PROMOS_DATA);

  const completedPromos = useMemo(() => {
    return promos.filter(promo => promo.closedStatus === 'closed');
  }, [promos]);

  return (
    <Container className="completed-page">
      <Breadcrumbs />

      <PromosDetailsList
        data={completedPromos}
      />
    </Container>
  );
}