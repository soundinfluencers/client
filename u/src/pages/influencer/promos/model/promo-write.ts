import { BUNDLES_AVAILABLE } from '@/shared/config/bundle-availability';
import { hasBundleLinks, isBundlePromo, isPromoId, isPromoPlatform } from './promo-read';
import type { DetailedPromo, NewBundlePromo, PlacementPromo } from '../types/promo-read.types';

export interface PromoGroupContext {
  campaignId: string; campaignBundleId: string; bundleId: string;
  memberIds: string[]; policy: string;
}
export interface PromoWriteTarget {
  campaignId: string; addedAccountsId?: string; group?: PromoGroupContext;
  kind: 'placement' | 'group' | 'member';
}
export type PromoWriteKind = 'decision' | 'completion';
export type PromoPhase = 'idle' | 'checking' | 'writing' | 'success' | 'refused' | 'unknown';
export interface PromoAttempt {
  key: string; attempt: number; epoch: number; target: PromoWriteTarget; kind: PromoWriteKind;
  action?: 'accept' | 'decline'; phase: PromoPhase; reading: boolean;
  needsRead: boolean; canRetry: boolean; message: string; scope: string;
  inspectionOrigin?: 'initial' | 'recovery';
  current?: PlacementPromo | NewBundlePromo;
}
export interface PromoWriteDeps {
  session: () => { epoch: number; active: boolean };
  detailed: (params: any) => Promise<DetailedPromo[]>;
  decision: (body: any, isCurrent?: () => boolean) => Promise<unknown>;
  completion: (body: any, group?: PromoGroupContext, isCurrent?: () => boolean) => Promise<unknown>;
  readBalance: (isCurrent?: () => boolean) => Promise<unknown>;
  patchBalance: (balance: number) => void;
}
export const validBalance = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const status = (error: any): number | undefined => error?.response?.status;
const message = (error: any) => {
  const value = error?.response?.data?.message ?? error?.message;
  return typeof value === 'string' ? value : 'Unable to complete the operation. Retry reading the promo.';
};
export function assertGroup(group: PromoGroupContext | undefined): asserts group is PromoGroupContext {
  if (!BUNDLES_AVAILABLE) throw new Error('Bundle promo actions are unavailable.');
  if (!group || !isPromoId(group.campaignId) || !isPromoId(group.campaignBundleId) || !isPromoId(group.bundleId) || group.policy !== 'all_or_nothing' || !group.memberIds?.length || group.memberIds.some(id => !isPromoId(id)) || new Set(group.memberIds).size !== group.memberIds.length) throw new Error('Complete frozen Bundle identity and all_or_nothing policy are required. Selective completion is unsupported.');
}
export function groupContext(promo: NewBundlePromo): PromoGroupContext {
  const group = { campaignId: promo.campaignId, campaignBundleId: promo.campaignBundleId, bundleId: promo.bundleId, memberIds: promo.accounts.map(a => a.addedAccountsId), policy: promo.acceptancePolicy ?? '' };
  assertGroup(group); return group;
}
export function groupTarget(promo: NewBundlePromo): PromoWriteTarget {
  return { kind: 'group', campaignId: promo.campaignId, group: { campaignId: promo.campaignId, campaignBundleId: promo.campaignBundleId, bundleId: promo.bundleId, memberIds: promo.accounts.map(a => a.addedAccountsId), policy: promo.acceptancePolicy ?? '' } };
}
export function assertTarget(target: PromoWriteTarget) {
  if (!isPromoId(target.campaignId)) throw new Error('Invalid campaign identity.');
  if (target.kind !== 'group' && !isPromoId(target.addedAccountsId)) throw new Error('Invalid placement identity.');
  if (target.kind !== 'placement' || target.group) {
    assertGroup(target.group);
    if (target.group.campaignId !== target.campaignId || (target.kind === 'member' && !target.group.memberIds.includes(target.addedAccountsId!))) throw new Error('Placement does not belong to the frozen Bundle.');
  }
}
const memberIds = (target: PromoWriteTarget) => target.kind === 'group' ? target.group!.memberIds : [target.addedAccountsId!];
export const promoAttemptKey = (epoch: number, kind: PromoWriteKind, target: PromoWriteTarget) => `${epoch}:${kind}:${target.campaignId}:${target.kind === 'group' ? 'group:' + target.group?.campaignBundleId : target.addedAccountsId}`;
export const placementTarget = (row: { campaignId: string; addedAccountsId: string }): PromoWriteTarget => ({ kind: 'placement', campaignId: row.campaignId, addedAccountsId: row.addedAccountsId });

// Only attempts and form drafts, not another campaign/entity store. Lifetime is
// this JS tab + auth epoch; unmount does not grant a second write permission.
export function createPromoWrites(deps: PromoWriteDeps) {
  const records = new Map<string, PromoAttempt>();
  const drafts = new Map<string, Record<string, unknown>>();
  const resources = new Map<string, PromoAttempt>();
  const knownGroups = new Map<string, string>();
  const listeners = new Set<() => void>();
  const finances = new Map<number, { revision: number; read: number }>();
  let version = 0, sequence = 0;
  const emit = () => { version++; listeners.forEach(f => f()); };
  const finance = (epoch: number) => { if (!finances.has(epoch)) finances.set(epoch, { revision: 0, read: 0 }); return finances.get(epoch)!; };
  const resourceKeys = (epoch: number, target: PromoWriteTarget) => memberIds(target).map(id => `${epoch}:${target.campaignId}:${id}`);
  const ownsAuth = (owner: ReturnType<PromoWriteDeps['session']>) => deps.session() === owner && owner.active;
  const record = (kind: PromoWriteKind, target: PromoWriteTarget, scope: string) => {
    const owner = deps.session(), key = promoAttemptKey(owner.epoch, kind, target);
    if (!records.has(key)) records.set(key, { key, attempt: 0, epoch: owner.epoch, target, kind, scope, phase: 'idle', reading: false, needsRead: false, canRetry: false, message: '' });
    return records.get(key)!;
  };
  const busy = (r: PromoAttempt) => r.phase === 'checking' || r.phase === 'writing' || r.reading;
  const terminal = (r: PromoAttempt) => r.phase === 'success' || r.phase === 'unknown';

  async function fresh(target: PromoWriteTarget, kind: PromoWriteKind, owns: () => boolean) {
    assertTarget(target);
    if (target.kind === 'placement' && resourceKeys(deps.session().epoch, target).some(key => knownGroups.has(key))) throw new Error('Known Bundle membership requires the frozen group context.');
    if (!owns()) throw new Error('The promo session changed.');
    const locator = target.kind === 'group' ? target.group!.memberIds[0] : target.addedAccountsId;
    // The member is a locator accepted by the existing endpoint, never a proxy
    // for group identity: exact frozen group + full membership are checked below.
    const rows = await deps.detailed({ status: kind === 'decision' ? 'new' : 'ongoing', campaignId: target.campaignId, addedAccountsId: locator, limit: 12, page: 1, isCurrent: owns });
    if (!owns()) throw new Error('The promo session changed.');
    const matches = rows.filter(row => row.campaignId === target.campaignId && (target.kind === 'group' ? isBundlePromo(row) && row.campaignBundleId === target.group!.campaignBundleId : !isBundlePromo(row) && row.addedAccountsId === target.addedAccountsId));
    if (matches.length !== 1) throw new Error('The requested placement is unavailable or ambiguous. Reopen it from the dashboard.');
    const row = matches[0];
    if (row.isPaused === true) throw new Error('Campaign is paused. Your changes have been kept.');
    if (row.isPaused !== false) throw new Error('Current pause permission is unavailable. Retry reading; backend metadata is required.');
    if (target.kind === 'group') {
      const group = groupContext(row as NewBundlePromo);
      if (group.bundleId !== target.group!.bundleId || group.policy !== target.group!.policy || [...group.memberIds].sort().join() !== [...target.group!.memberIds].sort().join()) throw new Error('The saved Bundle membership changed. Reopen the group.');
    } else {
      if (isBundlePromo(row)) throw new Error('Use the complete Bundle action.');
      if (target.kind === 'placement' && hasBundleLinks(row)) throw new Error('This placement belongs to a Bundle. Standalone actions are unavailable.');
      if (target.kind === 'member' && (row.campaignBundleId !== target.group!.campaignBundleId || row.bundleId !== target.group!.bundleId)) throw new Error('Backend Bundle member links are unavailable or changed. Results cannot be sent until this dependency is resolved.');
      if (kind === 'completion') {
        if (row.confirmation !== 'accept' || row.closedStatus !== 'wait') throw new Error('Current accepted/open status is unavailable or changed. Your results have been kept.');
        if (row.statusCampaign !== 'pending' && row.statusCampaign !== 'distributing') throw new Error('The campaign is no longer available for results.');
        if (!isPromoPlatform(row.accountSocialMedia) || row.accountSocialMedia === 'multipromo' || !row.username?.trim()) throw new Error('The current placement platform or username is unavailable.');
      } else if ((row.confirmation !== undefined && row.confirmation !== 'wait') || row.closedStatus === 'close') throw new Error('The promo request has already changed. Refresh before deciding.');
    }
    return row;
  }

  async function balance(owner: ReturnType<PromoWriteDeps['session']>, owns: () => boolean) {
    const f = finance(owner.epoch), revision = f.revision, request = ++f.read;
    if ([...records.values()].some(r => r.epoch === owner.epoch && r.kind === 'completion' && r.phase === 'writing')) throw new Error('Another completion is pending. Retry synchronization after it finishes.');
    const value = await deps.readBalance(owns);
    if (!owns()) throw new Error('The promo session changed.');
    if (revision !== f.revision || request !== f.read || [...records.values()].some(r => r.epoch === owner.epoch && r.kind === 'completion' && r.phase === 'writing')) throw new Error('Balance reading was superseded. Retry synchronization.');
    if (!validBalance(value)) throw new Error('The server balance is invalid. Retry reading; completion will not be repeated.');
    deps.patchBalance(value);
  }

  async function synchronize(r: PromoAttempt, owner: ReturnType<PromoWriteDeps['session']>, owns: () => boolean, syncQueries: (r: PromoAttempt) => Promise<void>) {
    if (!owns() || r.reading) return r;
    const attempt = r.attempt; r.reading = true; r.needsRead = true; emit();
    try {
      const errors: string[] = [];
      // Detail, balance and list reads are independent. Keep successful work
      // even when a neighbouring read fails, but stop as soon as ownership ends.
      const read = async (label: string, operation: () => Promise<void>) => {
        if (!owns()) throw new Error('The promo session changed.');
        try {
          await operation();
          if (!owns()) throw new Error('The promo session changed.');
        } catch (error) {
          if (!owns()) throw error;
          errors.push(`${label}: ${message(error)}`);
        }
      };
      if (r.phase === 'success') {
        const readStatus = r.kind === 'completion' ? 'close' : r.action === 'accept' ? 'ongoing' : 'new';
        // Decline has no dedicated detailed reader: known void success stands on
        // its own. An unpinned list is synchronization, not proof of an outcome.
        for (const id of r.kind === 'decision' && r.action === 'decline' ? [undefined] : memberIds(r.target)) {
          await read('Promo details', async () => {
            const rows = await deps.detailed({ status: readStatus, campaignId: id ? r.target.campaignId : undefined, addedAccountsId: id, limit: 12, page: 1, isCurrent: owns });
            if (!owns()) throw new Error('The promo session changed.');
            const saved = rows.find(row => !isBundlePromo(row) && row.campaignId === r.target.campaignId && row.addedAccountsId === id);
            if (id && !saved) throw new Error('The saved placement could not be synchronized. Retry reading.');
            if (id && r.target.group && (isBundlePromo(saved!) || (saved as PlacementPromo).campaignBundleId !== r.target.group.campaignBundleId || (saved as PlacementPromo).bundleId !== r.target.group.bundleId)) throw new Error('Backend group/member links are unavailable. The write succeeded; retry reading after the dependency is resolved.');
          });
        }
      } else {
        r.canRetry = false;
        await read('Promo eligibility', async () => { r.current = await fresh(r.target, r.kind, owns); r.canRetry = r.phase !== 'unknown'; });
      }
      if (r.kind === 'completion') await read('Balance', () => balance(owner, owns));
      await read('Promo lists', () => syncQueries(r));
      if (!owns()) throw new Error('The promo session changed.');
      r.needsRead = errors.length > 0;
      if (r.phase === 'success') r.message = errors.length ? 'Saved, but synchronization is incomplete. ' + errors.join(' ') : 'Saved successfully.';
      else if (r.phase === 'unknown') r.message = errors.length ? 'The write outcome remains unknown. Do not resubmit. ' + errors.join(' ') : 'The write outcome remains unknown. Current data was refreshed, but resubmission is blocked.';
      else if (errors.length) r.message = errors.join(' ');
    } catch (error) {
      if (r.attempt === attempt) { r.needsRead = true; if (owns()) r.message = (r.phase === 'success' ? 'Saved, but synchronization is incomplete. ' : '') + message(error); }
    } finally { if (r.attempt === attempt) { r.reading = false; emit(); } }
    return r;
  }

  async function inspect(kind: PromoWriteKind, target: PromoWriteTarget, scope: string, live: () => boolean) {
    const owner = deps.session(), owns = () => ownsAuth(owner) && live();
    const r = record(kind, target, scope);
    if (busy(r) || terminal(r)) return r;
    // A replacement form can encounter this busy read before its old owner
    // unmounts/changes scope. Leave a visible GET-only recovery if it is abandoned;
    // ownership still prevents the old response from publishing eligibility.
    // Keep the recovery marker for abandoned reads, but let the results form
    // distinguish a normal first check from a retry after a real failure.
    r.inspectionOrigin = r.needsRead ? 'recovery' : 'initial';
    r.reading = true; r.canRetry = false; r.needsRead = true;
    r.message = 'Promo eligibility is not confirmed. Retry reading if the check is interrupted.'; emit();
    try { r.current = await fresh(target, kind, owns); if (owns()) { r.canRetry = true; r.needsRead = false; r.message = ''; } }
    catch (error) { if (owns()) { r.message = message(error); r.needsRead = true; } }
    finally { r.reading = false; emit(); }
    return r;
  }

  async function execute(args: { kind: PromoWriteKind; target: PromoWriteTarget; action?: 'accept' | 'decline'; scope: string; live: () => boolean; body?: (row: PlacementPromo) => unknown; syncQueries: (r: PromoAttempt) => Promise<void> }) {
    const { kind, target, action, scope, live, syncQueries } = args;
    const owner = deps.session(), owns = () => ownsAuth(owner) && live();
    const r = record(kind, target, scope);
    if (!owns() || busy(r) || terminal(r) || (r.phase === 'refused' && !r.canRetry)) return r;
    try { assertTarget(target); } catch (error) { r.phase = 'refused'; r.message = message(error); emit(); return r; }
    const keys = resourceKeys(owner.epoch, target);
    if (keys.some(key => resources.has(key))) { r.phase = 'refused'; r.canRetry = false; r.needsRead = true; r.message = 'Another operation on this placement is pending or unresolved. Retry reading only.'; emit(); return r; }
    if (target.kind === 'placement' && keys.some(key => knownGroups.has(key))) { r.phase = 'refused'; r.message = 'Known Bundle membership requires the group context.'; emit(); return r; }
    r.attempt = ++sequence; r.phase = 'checking'; r.action = action; r.scope = scope; r.message = ''; r.canRetry = false; r.needsRead = false;
    keys.forEach(key => resources.set(key, r)); emit();
    let sent = false;
    try {
      r.current = await fresh(target, kind, owns);
      if (target.group) for (const key of keys) knownGroups.set(key, target.group.campaignBundleId);
      const body = kind === 'completion' ? args.body!(r.current as PlacementPromo) : target.kind === 'group'
        ? { campaignId: target.campaignId, campaignBundleId: target.group!.campaignBundleId, selectedAddedAccountsIds: [...target.group!.memberIds], campaignResponse: action }
        : { campaignId: target.campaignId, addedAccountsId: target.addedAccountsId, username: (r.current as PlacementPromo).username, campaignResponse: action };
      if (!owns()) throw new Error('The promo session changed before sending.');
      r.phase = 'writing'; sent = true;
      if (kind === 'completion') finance(owner.epoch).revision++;
      emit();
      const result = kind === 'completion' ? await deps.completion(body, target.group, owns) : await deps.decision(body, owns);
      // HTTP success is terminal BEFORE interpreting balance or reading again.
      r.phase = 'success'; r.needsRead = true; r.message = kind === 'completion' && !validBalance(result) ? 'Saved; the response balance is invalid. Retry synchronization if necessary.' : 'Saved; synchronizing.';
      if (kind === 'completion') finance(owner.epoch).revision++;
      emit();
    } catch (error) {
      const refusal = !sent || (status(error) !== undefined && status(error)! >= 400 && status(error)! < 500 && status(error) !== 408);
      r.phase = refusal ? 'refused' : 'unknown'; r.needsRead = true; r.message = refusal ? message(error) : 'The write outcome is unknown. Do not resubmit. Retry reading only.';
      if (sent && kind === 'completion') finance(owner.epoch).revision++;
      emit();
    } finally { if (r.phase !== 'unknown') keys.forEach(key => { if (resources.get(key) === r) resources.delete(key); }); }
    if (owns()) await synchronize(r, owner, owns, syncQueries);
    return r;
  }
  return {
    subscribe: (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; },
    version: () => version,
    all: () => [...records.values()],
    get: (kind: PromoWriteKind, target: PromoWriteTarget) => records.get(promoAttemptKey(deps.session().epoch, kind, target)),
    draft: (target: PromoWriteTarget) => drafts.get(promoAttemptKey(deps.session().epoch, 'completion', target)),
    saveDraft: (target: PromoWriteTarget, values: Record<string, unknown>) => { drafts.set(promoAttemptKey(deps.session().epoch, 'completion', target), { ...values }); },
    inspect, execute,
    recover: (r: PromoAttempt, live: () => boolean, sync: (r: PromoAttempt) => Promise<void>) => {
      const owner = deps.session();
      if (owner.epoch !== r.epoch || busy(r)) return Promise.resolve(r);
      return synchronize(r, owner, () => ownsAuth(owner) && live(), sync);
    },
  };
}
