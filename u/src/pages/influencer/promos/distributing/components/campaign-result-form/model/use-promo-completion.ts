import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createInfluencerPromoReview } from '@/api/influencer/promos/influencer-promos.api';
import { handleApiError } from '@/api/error.api';
import { getReaderSession, useReaderSession } from '@/shared/auth/reader-session';
import { BUNDLES_AVAILABLE } from '@/shared/config/bundle-availability';
import { useUser } from '@/store/get-user';
import { buildPromoResultBody } from '../../../../model/promo-result-transport';
import type { SubmitResultsNavState } from '../utils/distributing-nav.helper';

export function usePromoCompletion(state: SubmitResultsNavState, onSuccess: () => void) {
  const owner = useReaderSession(), location = useLocation(), client = useQueryClient();
  const scope = `${location.key}:${location.pathname}:${location.search}:${location.hash}:${state.campaignId}:${state.addedAccountsId}:${state.meta}`;
  const mounted = useRef(true), current = useRef({ owner, scope });
  current.current = { owner, scope };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const live = () => mounted.current && owner.active && getReaderSession() === owner && current.current.owner === owner && current.current.scope === scope;
  // Only the current form owns this lock. No persistent attempts or read recovery.
  const lock = useRef({ owner, scope, pending: false, completed: false });
  if (lock.current.owner !== owner || lock.current.scope !== scope) lock.current = { owner, scope, pending: false, completed: false };
  type Submission = { body: ReturnType<typeof buildPromoResultBody>; group: SubmitResultsNavState['bundleContext']; live: () => boolean; owner: typeof owner; lock: typeof lock.current; done: () => void };
  const mutation = useMutation({
    retry: false,
    mutationFn: (submission: Submission) => createInfluencerPromoReview(submission.body, submission.group, submission.live),
    onSuccess: (balance, submission) => {
      submission.lock.completed = true;
      if (!submission.live()) return;
      if (typeof balance === 'number' && Number.isFinite(balance) && balance >= 0 && useUser.getState().user) useUser.getState().patchUser({ balance });
      // Mark actual per-auth dashboard/detail keys stale, including inactive pins.
      // New list mounting owns its GET; no auxiliary read can hold the form here.
      try {
        void client.invalidateQueries({ predicate: query => ['promos', 'detailedPromos'].includes(String(query.queryKey[0])) && query.queryKey.at(-1) === submission.owner.epoch, refetchType: 'none' }).catch(() => {});
      } catch { /* The write succeeded. List read errors belong to the reader. */ }
      toast.success('Campaign result submitted successfully!');
      submission.done();
    },
    onError: (error, submission) => { if (submission.live()) handleApiError(error); },
    onSettled: (_data, _error, submission) => { submission.lock.pending = false; },
  });
  const submit = async (values: unknown) => {
    const attempt = lock.current;
    if (!live() || attempt.pending || attempt.completed) return;
    attempt.pending = true;
    let body: ReturnType<typeof buildPromoResultBody>;
    try {
      if (state.bundleContext && !BUNDLES_AVAILABLE) throw new Error('Bundle promo actions are unavailable.');
      body = buildPromoResultBody({ campaignId: state.campaignId, addedAccountsId: state.addedAccountsId, username: state.username }, state.meta, values);
    } catch (error) { attempt.pending = false; if (live()) handleApiError(error); return; }
    // The API error is displayed by onError. Neither failure nor timeout retries.
    await mutation.mutateAsync({ body, group: state.bundleContext, live, owner, lock: attempt, done: onSuccess }).catch(() => {});
  };
  return { owner, scope, live, submit, isPending: mutation.isPending && mutation.variables?.lock === lock.current, completed: lock.current.completed };
}
