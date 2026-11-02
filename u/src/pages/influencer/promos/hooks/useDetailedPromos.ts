import { getDetailedPromo } from '@/api/influencer/promos/influencer-promos.api';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getReaderSession, useReaderSession } from '@/shared/auth/reader-session';
import { mergePromoPages, matchesPin, isPromoId } from '../model/promo-read';
import type { DetailedPromo, PromoPage, PromoReadStatus } from '../types/promo-read.types';

interface UseDetailedPromosParams {
  status: PromoReadStatus; campaignId?: string; addedAccountsId?: string;
  limit?: number; enabled?: boolean;
}
// Only the unpinned GET determines page progression. No guessed base count.
export async function readPromoPage(params: UseDetailedPromosParams & { page: number }, signal?: AbortSignal, isCurrent = () => true): Promise<PromoPage<DetailedPromo>> {
  const { status, limit = 12, page, campaignId, addedAccountsId } = params;
  if ((campaignId !== undefined || addedAccountsId !== undefined) && (!isPromoId(campaignId) || !isPromoId(addedAccountsId))) throw new Error('Invalid promo link. Open a promo from the dashboard.');
  const assertCurrent = () => { signal?.throwIfAborted(); if (!isCurrent()) throw new Error('The authentication session changed.'); };
  assertCurrent();
  const base = await getDetailedPromo({ status, limit, page, signal });
  assertCurrent();
  if (page !== 1 || !campaignId || !addedAccountsId) return { items: base, baseCount: base.length };
  const pinned = await getDetailedPromo({ status, limit, page: 1, campaignId, addedAccountsId, signal });
  assertCurrent();
  const selected = pinned.find(row => matchesPin(row, { campaignId, addedAccountsId }));
  if (!selected) throw new Error('The requested promo is unavailable. Retry reading or return to the dashboard.');
  return { items: mergePromoPages([{ items: [selected, ...base] }]), baseCount: base.length };
}
export const useDetailedPromos = (params: UseDetailedPromosParams) => {
  const { status, campaignId, addedAccountsId, limit = 12, enabled = true } = params;
  const owner = useReaderSession();
  return useInfiniteQuery({
    queryKey: ['detailedPromos', status, campaignId ?? null, addedAccountsId ?? null, limit, owner.epoch],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1, signal }) => {
      const result = await readPromoPage({ ...params, limit, page: pageParam }, signal, () => getReaderSession() === owner);
      if (getReaderSession() !== owner) throw new Error('The authentication session changed.');
      return result;
    },
    getNextPageParam: (lastPage, pages) => lastPage.baseCount < limit ? undefined : pages.length + 1,
    select: data => ({ promos: mergePromoPages(data.pages) }),
    enabled: enabled && owner.active,
  });
};
