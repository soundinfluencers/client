import { BUNDLES_AVAILABLE } from '@/shared/config/bundle-availability';
import type { DashboardBundleDto, NewBundlePromo } from '../../types/promo-read.types';
import { formatPromoReward, hasDisplayValue, placementKey } from '../../model/promo-read';
import { DetailsRow } from '../promos-details-list/promos-details-list-card/DetailsRow';
import { normalizePromoStatus } from '@/pages/influencer/dashboard-layout/components/promos-list/utils/normalizePromoStatus';
import { getPromoFieldsBySocialMedia } from '../../data/promos.data';
import { ButtonMain, ButtonSecondary } from '@/components/ui/buttons-fix/ButtonFix';

export const BundleUnavailable = () => <p role="status">Bundle promos are currently unavailable.</p>;

// Prepared read-only presentation. Mutating callbacks await stage 9 and the
// backend handoff. No first-member proxy, client reward calculation or FX.
export function DashboardBundlePresentation({ promo }: { promo: DashboardBundleDto }) {
  return <article className="promos-details-list-card">
    <h3>Bundle promo</h3><p>Reward: {formatPromoReward(promo.reward)}</p>
    {!promo.campaignBundleId && <p>Group actions are unavailable.</p>}
    <ul>{promo.promos.map(member => <li key={placementKey(member)}>
      {member.campaignName ?? '—'} · {member.socialMedia ?? '—'} · {normalizePromoStatus(member.confirmation, member.closedStatus) || '—'}
      {member.isPaused === true && ' · Paused'}
    </li>)}</ul>
  </article>;
}
export function NewBundlePresentation({ promo, onDecision, actionState }: { promo: NewBundlePromo; onDecision?: (response: 'accept' | 'decline') => void; actionState?: { blocked: boolean; feedback: React.ReactNode } }) {
  return <article className="promos-details-list-card">
    <h3>{promo.campaignName ?? 'Bundle promo'}</h3>
    <p>{promo.clientName ?? '—'} · {promo.createdAt ?? '—'}</p>
    {promo.isPaused === true && <p>Campaign is paused</p>}
    <p>Policy: {promo.acceptancePolicy ?? '—'}</p>
    <p>Bundle reward: {promo.currency === 'EUR' ? formatPromoReward(promo.bundleReward) : '—'}</p>
    <p>Original reward: {promo.currency === 'EUR' ? formatPromoReward(promo.originalReward) : '—'}</p>
    {promo.accounts.map(account => <section key={account.addedAccountsId}>
      <h4>{account.username ?? '—'} · {account.accountSocialMedia ?? '—'}</h4>
      <p>Followers: {typeof account.followers === 'number' && Number.isFinite(account.followers) && account.followers >= 0 ? account.followers : '—'}</p>
      <p>Reward: {promo.currency === 'EUR' ? formatPromoReward(account.reward) : '—'}</p>
      {getPromoFieldsBySocialMedia(account.accountSocialMedia, 'pending')?.filter(field => field.key !== 'username' && field.key !== 'clientName').map(field => {
        const value = (account as unknown as Record<string, unknown>)[field.key];
        return hasDisplayValue(value) ? <DetailsRow key={field.key} label={field.label} value={String(value)} linkable={field.linkable} copyable={field.copyable} icon={field.icon} /> : null;
      })}
    </section>)}
    {BUNDLES_AVAILABLE && onDecision && <div className="promos-details-list-card__actions">
      <ButtonSecondary label="Decline" isDisabled={actionState?.blocked || promo.isPaused !== false || promo.acceptancePolicy !== 'all_or_nothing'} onClick={() => { if (BUNDLES_AVAILABLE && !actionState?.blocked && promo.isPaused === false && promo.acceptancePolicy === 'all_or_nothing') onDecision('decline'); }} />
      <ButtonMain label="Accept bundle promo" isDisabled={actionState?.blocked || promo.isPaused !== false || promo.acceptancePolicy !== 'all_or_nothing'} onClick={() => { if (BUNDLES_AVAILABLE && !actionState?.blocked && promo.isPaused === false && promo.acceptancePolicy === 'all_or_nothing') onDecision('accept'); }} />
    </div>}
    {actionState?.feedback}
  </article>;
}
export function BundlePromo({ promo, onDecision, actionState }: { promo: DashboardBundleDto | NewBundlePromo; onDecision?: (response: 'accept' | 'decline') => void; actionState?: { blocked: boolean; feedback: React.ReactNode } }) {
  if (!BUNDLES_AVAILABLE) return <BundleUnavailable />;
  return 'promos' in promo ? <DashboardBundlePresentation promo={promo} /> : <NewBundlePresentation promo={promo} actionState={actionState} onDecision={response => { if (BUNDLES_AVAILABLE && !actionState?.blocked) onDecision?.(response); }} />;
}
