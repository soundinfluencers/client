import type { TSocialMedia } from "../types/campaign-result-form.types";
import type { PromoGroupContext } from '../../../../model/promo-write';
import { isPromoId, isPromoPlatform } from '../../../../model/promo-read';

export type DistributingNavState = {
  campaignId?: string;
  addedAccountsId?: string;
};

export type SubmitResultsNavState = {
  campaignId: string;
  addedAccountsId: string;
  username: string;
  meta: TSocialMedia;
  bundleContext?: PromoGroupContext;

  // from?: DistributingNavState | null,
};

export const SUBMIT_HASH = "#submit";

export const isSubmitOpen = (hash: string) => hash === SUBMIT_HASH;

export const isSubmitState = (v: unknown): v is SubmitResultsNavState => {
  if (!v || typeof v !== "object") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = v as any;

  const base = isPromoId(o.campaignId) && isPromoId(o.addedAccountsId) &&
    typeof o.username === "string" && o.username.trim() !== '' &&
    isPromoPlatform(o.meta) && o.meta !== 'multipromo';

  if (!base) return false;
  // if (o.from == null) return true;
  return base;
};
