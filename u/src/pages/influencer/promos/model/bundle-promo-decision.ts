import { BUNDLES_AVAILABLE } from '@/shared/config/bundle-availability';
import type { BundleDecisionDto, NewBundlePromo } from '../types/promo-read.types';
import { isPromoId } from './promo-read';

// Prepared transport candidate, not an enabled action/controller. Full action
// ownership, permissions, write recovery and results remain stage 9 work.
export function buildBundleDecisionRequest(promo: NewBundlePromo, response: 'accept' | 'decline'): BundleDecisionDto | null {
  if (!BUNDLES_AVAILABLE || promo.isPaused !== false || !isPromoId(promo.campaignId) || !isPromoId(promo.campaignBundleId)) return null;
  if (!['all_or_nothing', 'selective'].includes(promo.acceptancePolicy ?? '') || !promo.accounts.length) return null;
  const members = promo.accounts.map(account => account.addedAccountsId);
  if (members.some(member => !isPromoId(member)) || new Set(members).size !== members.length) return null;
  return { campaignId: promo.campaignId, campaignBundleId: promo.campaignBundleId, selectedAddedAccountsIds: members, campaignResponse: response };
}
