import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { conformationInfluencerPromo } from '@/api/influencer/promos/influencer-promos.api';
import { handleApiError } from '@/api/error.api.ts';
import { getReaderSession, useReaderSession } from '@/shared/auth/reader-session';
import { groupContext } from '../../model/promo-write';
import type { TAcceptDeclineRequestPromoModel } from '../../types/promos.types';
import type { BundleDecisionDto, NewBundlePromo, PlacementIdentity } from '../../types/promo-read.types';
import { removeConfirmedNewPromo } from './remove-confirmed-new-promo';

export const useConfirmInfluencerPromo = () => {
  const client = useQueryClient(), owner = useReaderSession(), location = useLocation();
  const scope = `${location.key}:${location.pathname}:${location.search}:${location.hash}`;
  const current = useRef({ owner, scope }); current.current = { owner, scope };
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const owned = () => owner.active && getReaderSession() === owner;
  const live = () => mounted.current && owned() && current.current.owner === owner && current.current.scope === scope;
  const [, render] = useState(0);
  type Submission = { body: TAcceptDeclineRequestPromoModel | BundleDecisionDto; keys: string[]; locks: Map<string, Submission>; live: () => boolean; owned: () => boolean; epoch: number; done?: () => void };
  // An internal pin cleanup changes the URL without unmounting New. Pending
  // placements stay locked until settlement; page ownership still gates UI.
  const state = useRef({ owner, locks: new Map<string, Submission>() });
  if (state.current.owner !== owner) state.current = { owner, locks: new Map() };
  const key = (row: PlacementIdentity) => `${row.campaignId}:${row.addedAccountsId}`;
  const mutation = useMutation({
    retry: false,
    mutationFn: (submission: Submission) => conformationInfluencerPromo(submission.body, submission.live),
    onSuccess: (_data, submission) => {
      if (!submission.owned()) return;
      removeConfirmedNewPromo(client, submission.body, submission.epoch);
      if (submission.live()) submission.done?.();
      // The modal and removal follow the PATCH, never an auxiliary GET.
      // Mark consumed pin queries stale but do not refetch their New endpoint.
      const relevant = (query: { queryKey: readonly unknown[] }) => ['promos', 'detailedPromos'].includes(String(query.queryKey[0])) && query.queryKey.at(-1) === submission.epoch;
      const ids = 'selectedAddedAccountsIds' in submission.body ? submission.body.selectedAddedAccountsIds : [submission.body.addedAccountsId];
      try {
        void client.invalidateQueries({ predicate: relevant, refetchType: 'none' }).catch(() => {});
        void client.refetchQueries({ type: 'active', predicate: query => relevant(query) && !(query.queryKey[0] === 'detailedPromos' && query.queryKey[1] === 'new' && query.queryKey[2] === submission.body.campaignId && ids.includes(String(query.queryKey[3]))) }).catch(() => {});
      } catch { /* PATCH success is independent of list synchronization. */ }
    },
    onError: (error, submission) => { if (submission.live()) handleApiError(error); },
    onSettled: (_data, _error, submission) => {
      for (const resource of submission.keys) if (submission.locks.get(resource) === submission) submission.locks.delete(resource);
      if (mounted.current && getReaderSession() === owner && submission.epoch === owner.epoch) render(n => n + 1);
    },
  });
  const submit = async (body: Submission['body'], callbacks?: { onSuccess?: () => void }) => {
    if (!live()) return;
    const ids = 'selectedAddedAccountsIds' in body ? body.selectedAddedAccountsIds : [body.addedAccountsId];
    const keys = ids.map(addedAccountsId => key({ campaignId: body.campaignId, addedAccountsId }));
    const locks = state.current.locks;
    if (keys.some(resource => locks.has(resource))) return;
    const submission: Submission = { body, keys, locks, live, owned, epoch: owner.epoch, done: callbacks?.onSuccess };
    keys.forEach(resource => locks.set(resource, submission)); render(n => n + 1);
    await mutation.mutateAsync(submission).catch(() => {});
  };
  return {
    mutate: (body: TAcceptDeclineRequestPromoModel, callbacks?: { onSuccess?: () => void }) => submit({ ...body }, callbacks),
    stateFor: (row: PlacementIdentity) => {
      const submission = state.current.locks.get(key(row));
      return { isPending: !!submission, variables: submission && !('campaignBundleId' in submission.body) ? submission.body : undefined };
    },
    confirmBundle: async (promo: NewBundlePromo, action: 'accept' | 'decline', callbacks?: { onSuccess?: () => void }) => {
      try {
        const group = groupContext(promo);
        if (promo.isPaused !== false) throw new Error('Bundle promo availability is not confirmed.');
        return submit({ campaignId: group.campaignId, campaignBundleId: group.campaignBundleId, selectedAddedAccountsIds: [...group.memberIds], campaignResponse: action }, callbacks);
      } catch (error) { if (live()) handleApiError(error); }
    },
  };
};
