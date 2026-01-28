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
};

const SUBMIT_HASH = "#submit";

export const isSubmitOpen = (hash: string) => hash === SUBMIT_HASH;

export const isSubmitState = (v: unknown): v is SubmitResultsNavState => {
  if (!v || typeof v !== "object") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = v as any;
  return typeof o.campaignId === "string"
    && typeof o.addedAccountsId === "string"
    && typeof o.username === "string" // или meta присутствует
    && o.meta != null;
};