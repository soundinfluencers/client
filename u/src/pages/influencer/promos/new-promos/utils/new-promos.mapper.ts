import type {
  BundleNewPromo,
  BundlePromoAccount,
  NewPromo,
  StandaloneNewPromo,
} from "../../types/promos.types";

const orderBundleAccounts = (
  accounts: readonly BundlePromoAccount[],
): BundlePromoAccount[] => {
  const positions = accounts.map(({ bundlePosition }) => bundlePosition);
  const hasInvalidPosition = positions.some((position) => !Number.isFinite(position));
  const hasDuplicatePosition = new Set(positions).size !== positions.length;

  if (hasInvalidPosition || hasDuplicatePosition) {
    return [...accounts];
  }

  return [...accounts].sort(
    (left, right) => left.bundlePosition - right.bundlePosition,
  );
};

const mapNewPromo = (promo: NewPromo): NewPromo => {
  if (promo.promoType === "standalone") {
    return promo;
  }

  return {
    ...promo,
    accounts: orderBundleAccounts(promo.accounts),
  };
};

export const mapNewPromos = (promos: readonly NewPromo[]): NewPromo[] =>
  promos.map(mapNewPromo);

export const isStandaloneNewPromo = (
  promo: NewPromo,
): promo is StandaloneNewPromo => promo.promoType === "standalone";

export const isBundleNewPromo = (
  promo: NewPromo,
): promo is BundleNewPromo => promo.promoType === "bundle";
