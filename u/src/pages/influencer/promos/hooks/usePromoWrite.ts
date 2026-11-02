import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getReaderSession, useReaderSession } from '@/shared/auth/reader-session';
import { promoWrites } from '../model/promo-write-runtime';
import type { PromoAttempt, PromoWriteTarget } from '../model/promo-write';

export function usePromoWrite(contextSuffix = '') {
  const owner = useReaderSession(), location = useLocation(), client = useQueryClient();
  const scope = `${location.key}:${location.pathname}:${location.search}:${location.hash}:${contextSuffix}`;
  const mounted = useRef(true), current = useRef({ scope, owner }); current.current = { scope, owner };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const version = useSyncExternalStore(promoWrites.subscribe, promoWrites.version, promoWrites.version);
  const live = () => mounted.current && current.current.scope === scope && current.current.owner === owner && getReaderSession() === owner;
  const syncQueries = async (record: PromoAttempt) => {
    if (!live()) throw new Error('The promo session changed.');
    const relevant = (q: any) => ['promos', 'detailedPromos'].includes(q.queryKey[0]) && q.queryKey.at(-1) === owner.epoch;
    await client.invalidateQueries({ predicate: relevant, refetchType: 'none' });
    if (!live()) throw new Error('The promo session changed.');
    const ids = record.target.kind === 'group' ? record.target.group!.memberIds : [record.target.addedAccountsId];
    await client.refetchQueries({ type: 'active', predicate: (q: any) => {
      if (!relevant(q)) return false;
      // These pinned readers are expected to become ineligible after success.
      // They are marked stale, then the owned success continuation removes pin.
      return !(record.phase === 'success' && q.queryKey[0] === 'detailedPromos' && q.queryKey[1] === (record.kind === 'completion' ? 'ongoing' : 'new') && q.queryKey[2] === record.target.campaignId && ids.includes(q.queryKey[3]));
    } }, { throwOnError: true });
  };
  const recover = async (record: PromoAttempt, onSuccess?: () => void) => {
    await promoWrites.recover(record, live, syncQueries);
    if (live() && record.phase === 'success' && !record.needsRead && !record.reading) onSuccess?.();
  };
  return { owner, scope, live, syncQueries, recover, version, records: promoWrites.all().filter(r => r.epoch === owner.epoch), runtime: promoWrites };
}
export const placementTarget = (row: { campaignId: string; addedAccountsId: string }): PromoWriteTarget => ({ kind: 'placement', campaignId: row.campaignId, addedAccountsId: row.addedAccountsId });
