import { BUNDLES_AVAILABLE } from '@/shared/config/bundle-availability';
import type { NewBundlePromo, PlacementPromo } from '../../types/promo-read.types';
import { groupContext } from '../../model/promo-write';
import { isPromoPlatform } from '../../model/promo-read';
import type { SubmitResultsNavState } from '../../distributing/components/campaign-result-form/utils/distributing-nav.helper';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';

export function prepareBundleMemberResults(member: PlacementPromo, group: NewBundlePromo): SubmitResultsNavState {
  const context = groupContext(group);
  if (member.campaignId !== context.campaignId || member.campaignBundleId !== context.campaignBundleId || member.bundleId !== context.bundleId || !context.memberIds.includes(member.addedAccountsId) || !member.username || !isPromoPlatform(member.accountSocialMedia) || member.accountSocialMedia === 'multipromo') throw new Error('The backend has not provided consistent frozen Bundle member identity/policy.');
  return { campaignId: member.campaignId, addedAccountsId: member.addedAccountsId, username: member.username, meta: member.accountSocialMedia, bundleContext: context };
}
export function BundleMemberResultsEntry({ member, group, onOpen }: { member: PlacementPromo; group?: NewBundlePromo; onOpen: (state: SubmitResultsNavState) => void }) {
  if (!BUNDLES_AVAILABLE) return <p>Bundle promos are currently unavailable.</p>;
  if (!group) return <p>Bundle results require saved group identity and policy from the backend.</p>;
  let state: SubmitResultsNavState;
  try { state = prepareBundleMemberResults(member, group); } catch (error) { return <p>{(error as Error).message}</p>; }
  return <ButtonMain label="Submit results & get paid" isDisabled={member.isPaused !== false || member.confirmation !== 'accept' || member.closedStatus !== 'wait'} onClick={() => { if (BUNDLES_AVAILABLE && member.isPaused === false && member.confirmation === 'accept' && member.closedStatus === 'wait') onOpen(state); }} />;
}
