import type {
  BundleNewPromo,
  TBundlePromoDecisionRequest,
  TPromoDecision,
} from "../../types/promos.types";

export const canSubmitBundleDecision = (promo: BundleNewPromo): boolean =>
  Boolean(promo.campaignId && promo.campaignBundleId) &&
  promo.accounts.length > 0 &&
  promo.accounts.every(({ addedAccountsId }) => Boolean(addedAccountsId));

export const buildBundleDecisionRequest = (
  promo: BundleNewPromo,
  campaignResponse: TPromoDecision,
): TBundlePromoDecisionRequest | null => {
  if (!canSubmitBundleDecision(promo)) {
    return null;
  }

  return {
    campaignId: promo.campaignId,
    campaignBundleId: promo.campaignBundleId,
    selectedAddedAccountsIds: promo.accounts.map(
      ({ addedAccountsId }) => addedAccountsId,
    ),
    campaignResponse,
  };
};
