import type { TSocialMedia } from "../types/campaign-result-form.types";

export type DistributingNavState = {
  campaignId?: string;
  addedAccountsId?: string;
};

export type SubmitResultsNavState = {
  campaignId: string;
  addedAccountsId: string;
  username: string;
  meta: TSocialMedia;

  from?: DistributingNavState | null,
};

const SUBMIT_HASH = "#submit";

export const isSubmitOpen = (hash: string) => hash === SUBMIT_HASH;

export const isSubmitState = (v: unknown): v is SubmitResultsNavState => {
  if (!v || typeof v !== "object") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = v as any;

  const base = typeof o.campaignId === "string" &&
    typeof o.addedAccountsId === "string" &&
    typeof o.username === "string" &&
    o.meta != null;

  if (!base) return false;
  if (o.from == null) return true;
  return typeof o.from === "object";
};