import type {
    BundleCardDisplayModel,
} from "@/entities/client-side/campaign-creator-page/bundle/ui/bundle-card/bundle-card.types";
import { BundleCard } from "@/entities/client-side/campaign-creator-page/bundle/ui/bundle-card/bundle-card";
// import { getSocialMediaIcon } from "@/constants/social-medias";
import { CardSkeleton } from "@components/ui/skeletons/card-skeleton";

import styles from "./bundle-grid.module.scss";

type Props = {
    bundles: readonly BundleCardDisplayModel[];
    activeBundleId: string | null;
    selectedBundleIds: ReadonlySet<string>;
    includedBundleIds: ReadonlySet<string>;
    disabledBundleIds: ReadonlySet<string>;
    onToggleDetails: (bundleId: string) => void;
    onCloseDetails: () => void;
    onChoose: (bundleId: string) => void;
    onRemove: (bundleId: string) => void;
};

// const MOCK_BUNDLE_ACCOUNTS = [
//     {
//         accountId: "mock-account-1",
//         username: "Techno Fraternity",
//         platformIcon: getSocialMediaIcon("youtube"),
//         platformLabel: "YouTube",
//         followersLabel: "268K",
//         priceLabel: "500€",
//         genres: ["Techno", "House", "EDM"],
//         countries: ["US 18.2%", "Germany 12.4%", "UK 8.1%"],
//     },
//     {
//         accountId: "mock-account-2",
//         username: "Groove Bassment",
//         platformIcon: getSocialMediaIcon("instagram"),
//         platformLabel: "Instagram",
//         followersLabel: "742K",
//         priceLabel: "650€",
//         genres: ["House", "Bass", "Dance"],
//         countries: ["Brazil 14.6%", "US 11.3%", "Spain 7.8%"],
//     },
//     {
//         accountId: "mock-account-3",
//         username: "Electronic Pulse",
//         platformIcon: getSocialMediaIcon("tiktok"),
//         platformLabel: "TikTok",
//         followersLabel: "1.1M",
//         priceLabel: "800€",
//         genres: ["Techno", "Trance", "D&B"],
//         countries: ["UK 15.1%", "France 9.7%", "Italy 6.5%"],
//     },
// ] satisfies BundleCardDisplayModel["accounts"];
//
// export const MOCK_BUNDLES = [
//     {
//         bundleId: "mock-bundle-1",
//         followersLabel: "2.1M",
//         accounts: MOCK_BUNDLE_ACCOUNTS,
//         priceLabel: "1,450€",
//         originalPriceLabel: "1,950€",
//     },
//     {
//         bundleId: "mock-bundle-2",
//         followersLabel: "1.8M",
//         accounts: MOCK_BUNDLE_ACCOUNTS,
//         priceLabel: "1,300€",
//         originalPriceLabel: "1,750€",
//     },
//     {
//         bundleId: "mock-bundle-3",
//         followersLabel: "2.7M",
//         accounts: MOCK_BUNDLE_ACCOUNTS,
//         priceLabel: "1,750€",
//         originalPriceLabel: "2,250€",
//     },
//     {
//         bundleId: "mock-bundle-4",
//         followersLabel: "980K",
//         accounts: MOCK_BUNDLE_ACCOUNTS,
//         priceLabel: "950€",
//         originalPriceLabel: "1,250€",
//     },
//     {
//         bundleId: "mock-bundle-5",
//         followersLabel: "3.4M",
//         accounts: MOCK_BUNDLE_ACCOUNTS,
//         priceLabel: "2,100€",
//         originalPriceLabel: "2,800€",
//     },
//     {
//         bundleId: "mock-bundle-6",
//         followersLabel: "1.5M",
//         accounts: MOCK_BUNDLE_ACCOUNTS,
//         priceLabel: "1,150€",
//         originalPriceLabel: "1,600€",
//     },
//     {
//         bundleId: "mock-bundle-7",
//         followersLabel: "4.2M",
//         accounts: MOCK_BUNDLE_ACCOUNTS,
//         priceLabel: "2,600€",
//         originalPriceLabel: "3,400€",
//     },
//     {
//         bundleId: "mock-bundle-8",
//         followersLabel: "2.3M",
//         accounts: MOCK_BUNDLE_ACCOUNTS,
//         priceLabel: "1,600€",
//         originalPriceLabel: "2,100€",
//     },
// ] satisfies readonly BundleCardDisplayModel[];

export const BundleGrid = ({
    bundles,
    activeBundleId,
    selectedBundleIds,
    includedBundleIds,
    disabledBundleIds,
    onToggleDetails,
    onCloseDetails,
    onChoose,
    onRemove,
}: Props) => {
    return (
        <div className={styles.grid}>
            {bundles.map((bundle) => (
                <BundleCard
                    key={bundle.bundleId}
                    bundle={bundle}
                    isExpanded={activeBundleId === bundle.bundleId}
                    isSelected={selectedBundleIds.has(bundle.bundleId)}
                    isIncludedInSelectedOffer={includedBundleIds.has(
                        bundle.bundleId,
                    )}
                    chooseDisabled={disabledBundleIds.has(
                        bundle.bundleId,
                    )}
                    onToggleDetails={onToggleDetails}
                    onCloseDetails={onCloseDetails}
                    onChoose={onChoose}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
};

export const BundleGridSkeleton = () => {
    return (
        <div className={`${styles.grid} ${styles.loading}`}>
            {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
            ))}
        </div>
    );
};
