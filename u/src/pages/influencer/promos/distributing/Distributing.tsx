import { useMemo, useState } from 'react';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';
import { NEW_PROMOS_DATA, type IInfluencerNewPromo } from '../../../../types/influencer/promos.types';

import './_distributing.scss';
import { CampaignResultForm } from './components/CampaignResultForm';
import type { Platform } from './components/types';

export const Distributing = () => {
  const [promos, setPromos] = useState<IInfluencerNewPromo[]>(NEW_PROMOS_DATA);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [meta, setMeta] = useState<Platform>('');

  const distributingPromos = useMemo(() => {
    return promos.filter(promo => promo.closedStatus === 'open');
  }, [promos]);

  if (isFormOpen) {
    return <CampaignResultForm meta={meta} onFormClose={() => setIsFormOpen(false)} />;
  }

  return (
    <div className='distributing-page'>
      <PromosDetailsList
        data={distributingPromos}
        onFormOpen={() => setIsFormOpen(true)}
        onMetaChange={(newMeta) => setMeta(newMeta)}
      />
    </div>
  );
};