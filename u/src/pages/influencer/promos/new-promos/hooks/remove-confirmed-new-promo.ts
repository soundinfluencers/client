import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { isBundlePromo } from '../../model/promo-read';
import type { TAcceptDeclineRequestPromoModel } from '../../types/promos.types';
import type { BundleDecisionDto, DetailedPromo, PromoPage } from '../../types/promo-read.types';

// PATCH-success cache maintenance, never an optimistic removal. Keep server page
// counts and pageParams: filtered/displayed rows do not define pagination.
export function removeConfirmedNewPromo(client: QueryClient, body: TAcceptDeclineRequestPromoModel | BundleDecisionDto, epoch: number) {
  type Data = InfiniteData<PromoPage<DetailedPromo>>;
  const filter = { predicate: (query: { queryKey: readonly unknown[] }) => query.queryKey[0] === 'detailedPromos' && query.queryKey[1] === 'new' && query.queryKey.at(-1) === epoch };
  // Stop an older GET from putting the consumed placement back after success.
  void client.cancelQueries(filter).catch(() => {});
  const ids = 'selectedAddedAccountsIds' in body ? body.selectedAddedAccountsIds : [body.addedAccountsId];
  client.setQueriesData<Data>(filter, old => old && ({ ...old, pages: old.pages.map(page => ({ ...page, items: page.items.filter(row => {
    if (row.campaignId !== body.campaignId) return true;
    if (isBundlePromo(row)) return !('campaignBundleId' in body && row.campaignBundleId === body.campaignBundleId);
    return 'campaignBundleId' in body || row.addedAccountsId !== body.addedAccountsId;
  }) })) }));
  // Clearing a consumed pin changes the query key. Seed its unpinned reader so
  // the already-loaded list and the last-card success modal survive that change.
  for (const [queryKey, data] of client.getQueriesData<Data>(filter)) {
    if (data && queryKey[2] === body.campaignId && ids.includes(String(queryKey[3]))) {
      const unpinned = [...queryKey]; unpinned[2] = null; unpinned[3] = null;
      if (!client.getQueryData(unpinned)) client.setQueryData(unpinned, data);
    }
  }
}
