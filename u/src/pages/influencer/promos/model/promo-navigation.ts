import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isPromoId } from './promo-read';
import type { PlacementIdentity } from '../types/promo-read.types';

export type PromoLocationContext = { pin?: PlacementIdentity; invalid: boolean; legacy: boolean };
export function parsePromoLocation(search: string, state?: unknown): PromoLocationContext {
  const query = new URLSearchParams(search);
  if (query.has('bundleId') || query.has('campaignBundleId') || (state && typeof state === 'object' && ('bundleId' in state || 'campaignBundleId' in state))) return { invalid: true, legacy: false };
  const explicit = query.has('campaignId') || query.has('addedAccountsId');
  const legacy = !explicit && !!state && typeof state === 'object' && ('campaignId' in state || 'addedAccountsId' in state);
  const source = explicit ? { campaignId: query.get('campaignId'), addedAccountsId: query.get('addedAccountsId') } : legacy ? state as Record<string, unknown> : null;
  if (!source) return { invalid: false, legacy: false };
  if ((explicit && (query.getAll('campaignId').length !== 1 || query.getAll('addedAccountsId').length !== 1)) || !isPromoId(source.campaignId) || !isPromoId(source.addedAccountsId)) return { invalid: true, legacy };
  return { pin: { campaignId: source.campaignId.toLowerCase(), addedAccountsId: source.addedAccountsId.toLowerCase() }, invalid: false, legacy };
}
export const promoSearch = (pin: PlacementIdentity) => `?${new URLSearchParams({ campaignId: pin.campaignId, addedAccountsId: pin.addedAccountsId })}`;
export function usePromoLocation() {
  const location = useLocation(); const navigate = useNavigate();
  const context = parsePromoLocation(location.search, location.state);
  // Preserve existing history-state links, but make their identity reproducible
  // on F5/copy/Back. Never clear it at mount or replace a malformed query.
  useEffect(() => {
    if (context.legacy && context.pin) navigate({ pathname: location.pathname, search: promoSearch(context.pin), hash: location.hash }, { replace: true, state: location.state });
  }, [location.pathname, location.search, location.hash, location.state, navigate]);
  return context;
}
