export type BundleCompactAccountDisplayModel = {
    accountId: string;
    username: string;
    platformIcon: string | null;
    platformLabel: string;
    followersLabel: string;
    priceLabel: string | null;
};

export type BundleChipDisplayModel = {
    key: string;
    label: string;
};

export type BundleAccountDisplayModel = BundleCompactAccountDisplayModel & {
    genres: readonly BundleChipDisplayModel[];
    countries: readonly BundleChipDisplayModel[];
};

export type BundleCardDisplayModel = {
    bundleId: string;
    followersLabel: string;
    accounts: readonly BundleAccountDisplayModel[];
    priceLabel: string | null;
    originalPriceLabel: string | null;
};
