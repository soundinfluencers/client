import { conformationInfluencerPromo, createInfluencerPromoReview, getDetailedPromo, readInfluencerBalance } from '@/api/influencer/promos/influencer-promos.api';
import { getReaderSession } from '@/shared/auth/reader-session';
import { useUser } from '@/store/get-user';
import { createPromoWrites } from './promo-write';

export const promoWrites = createPromoWrites({
  session: getReaderSession, detailed: getDetailedPromo,
  decision: conformationInfluencerPromo, completion: createInfluencerPromoReview,
  readBalance: readInfluencerBalance,
  patchBalance: balance => { if (useUser.getState().user) useUser.getState().patchUser({ balance }); },
});
