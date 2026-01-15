import { useMemo, useState } from 'react';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';
import { NEW_PROMOS_DATA, type IInfluencerPromo } from '../../../../types/influencer/promos/promos.types';
import { CampaignResultForm } from './components/campaign-result-form/CampaignResultForm';
import { Breadcrumbs, Container } from '../../../../components';
import type { TSocialMedia } from '../../../../types/influencer/form/campaign-result/campaign-result.types';

import './_distributing.scss';

//TODO: REVIEW AND FIX THE FUNCTIONALITY AS NEEDED
export const Distributing = () => {
  const [promos, setPromos] = useState<IInfluencerPromo[]>(NEW_PROMOS_DATA);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [meta, setMeta] = useState<TSocialMedia | null>(null);

  const distributingPromos = useMemo(() => {
    return promos.filter(promo => promo.closedStatus === 'open');
  }, [promos]);

  return (
    <Container className='distributing-page'>
      <Breadcrumbs />
      {isFormOpen && meta ? (
        <CampaignResultForm meta={meta} onFormClose={() => setIsFormOpen(false)} />
      ) : (
        <PromosDetailsList
          data={distributingPromos}
          onFormOpen={() => setIsFormOpen(true)}
          onMetaChange={(newMeta) => setMeta(newMeta)}
        />
      )}

      {/*TODO: Modal */}
    </Container>
  );
};