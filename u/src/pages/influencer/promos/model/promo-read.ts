import type { DashboardPromo, DashboardPlacementDto, DetailedPromo, NewBundlePromo, PlacementIdentity, PlacementPromo, PromoPlatform, PromoReadStatus } from '../types/promo-read.types';

export const isPromoId = (v: unknown): v is string => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
const object = (v: unknown): Record<string, any> => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Invalid promo response. Retry reading.');
  return v as Record<string, any>;
};
const array = (v: unknown): unknown[] => { if (!Array.isArray(v)) throw new Error('Invalid promo list. Retry reading.'); return v; };
const id = (v: unknown) => { if (!isPromoId(v)) throw new Error('Promo placement identity is unavailable. Retry reading.'); return v; };
function assertDistinct(ids: string[]) {
  if (!ids.length || new Set(ids).size !== ids.length) throw new Error('Promo group membership is incomplete or ambiguous. Retry reading.');
}
function placement(v: unknown) {
  const row = object(v); id(row.campaignId); id(row.addedAccountsId);
  // Do not normalize missing pause/group metadata to false/standalone.
  return { ...row };
}
export function readDashboardPromos(value: unknown): DashboardPromo[] {
  return array(value).map(v => {
    const row = object(v);
    if (row.type === 'bundle') {
      id(row.bundleId);
      const promos = array(row.promos).map(placement);
      assertDistinct(promos.map(p => `${p.campaignId}:${p.addedAccountsId}`));
      return { ...row, promos } as DashboardPromo;
    }
    if (row.type !== 'standalone') throw new Error('Unsupported dashboard promo response. Retry reading.');
    return placement(row) as DashboardPromo;
  });
}
export function readDetailedPromos(value: unknown, status: PromoReadStatus): DetailedPromo[] {
  return array(value).map(v => {
    const row = object(v);
    if (status === 'new' && row.promoType === 'bundle') {
      id(row.campaignId); id(row.campaignBundleId); id(row.bundleId);
      const accounts = array(row.accounts).map(a => { const account = object(a); id(account.addedAccountsId); return { ...account }; });
      assertDistinct(accounts.map(a => a.addedAccountsId));
      const positions = accounts.map(a => a.bundlePosition);
      if (positions.every(Number.isInteger) && new Set(positions).size === positions.length) accounts.sort((a, b) => a.bundlePosition - b.bundlePosition);
      return { ...row, accounts, readKind: status } as NewBundlePromo;
    }
    if (status === 'new' && row.promoType !== 'standalone') throw new Error('Unsupported new promo response. Retry reading.');
    return { ...placement(row), readKind: status } as PlacementPromo;
  });
}
export const isBundlePromo = (row: DetailedPromo): row is NewBundlePromo => 'promoType' in row && row.promoType === 'bundle';
export const hasBundleLinks = (row: object) => {
  const r = row as Record<string, unknown>;
  return r.promoType === 'bundle' || r.type === 'bundle' || r.bundleId != null || r.campaignBundleId != null;
};
export const placementKey = (row: PlacementIdentity) => `${row.campaignId}:${row.addedAccountsId}`;
export function detailKey(row: DetailedPromo): string {
  return isBundlePromo(row) ? `bundle:${row.campaignId}:${row.campaignBundleId}` : `placement:${placementKey(row)}`;
}
export function dashboardKey(row: DashboardPromo): string {
  if (row.type === 'standalone') return `placement:${row.source ?? ''}:${placementKey(row)}`;
  // Catalogue ID alone is NOT a group identity. No fabricated transport ID.
  return `bundle:${row.bundleId}:${row.promos.map(p => `${p.source ?? ''}:${placementKey(p)}`).sort().join('|')}`;
}
export function mergePromoPages(pages: { items: DetailedPromo[] }[]): DetailedPromo[] {
  const seen = new Set<string>();
  return pages.flatMap(p => p.items).filter(row => { const key = detailKey(row); if (seen.has(key)) return false; seen.add(key); return true; });
}
export function matchesPin(row: DetailedPromo, pin: PlacementIdentity): boolean {
  return row.campaignId.toLowerCase() === pin.campaignId.toLowerCase() && (isBundlePromo(row) ? row.accounts.some(a => a.addedAccountsId.toLowerCase() === pin.addedAccountsId.toLowerCase()) : row.addedAccountsId.toLowerCase() === pin.addedAccountsId.toLowerCase());
}
export function formatPromoReward(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? `${value}€` : '—';
}
export const hasDisplayValue = (value: unknown) => value != null && (typeof value !== 'string' || value.trim() !== '');
export const isPromoPlatform = (value: unknown): value is PromoPlatform => typeof value === 'string' && ['instagram','tiktok','youtube','facebook','spotify','press','soundcloud','multipromo'].includes(value);
export function canUsePlacementAction(row: PlacementPromo | DashboardPlacementDto): boolean {
  return canNavigatePlacement(row) && row.isPaused !== true;
}
export const canNavigatePlacement = (row: PlacementIdentity) => isPromoId(row.campaignId) && isPromoId(row.addedAccountsId) && !hasBundleLinks(row);
