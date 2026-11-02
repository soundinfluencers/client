import { useInfiniteQuery } from '@tanstack/react-query';
import { getInfluencerPromos } from '@/api/influencer/promos/influencer-promos.api';
import { getReaderSession, useReaderSession } from '@/shared/auth/reader-session';
import type { TFilterStatus } from '../types/promos.types';

export function useDashboardPromos(status: TFilterStatus, limit: number) {
  const owner = useReaderSession();
  return useInfiniteQuery({
    queryKey: ['promos', status, limit, owner.epoch],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      if (getReaderSession() !== owner) throw new Error('The authentication session changed.');
      const items = await getInfluencerPromos(status, limit, pageParam, signal);
      if (getReaderSession() !== owner) throw new Error('The authentication session changed.');
      return items;
    },
    // One group is one server item, independent of its number of members.
    getNextPageParam: (lastPage, pages) => lastPage.length < limit ? undefined : pages.length + 1,
    staleTime: 1000,
    enabled: owner.active,
  });
}
