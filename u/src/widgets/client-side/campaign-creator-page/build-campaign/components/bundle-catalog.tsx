import { useCallback, useEffect, useState } from "react";

import type {
    BundleCardDisplayModel,
} from "@/entities/client-side/campaign-creator-page/bundle/ui/bundle-card/bundle-card.types";

import { BundleGrid } from "./bundle-grid";

type Props = {
    bundles: readonly BundleCardDisplayModel[];
    selectedBundleIds: ReadonlySet<string>;
    includedBundleIds: ReadonlySet<string>;
    disabledBundleIds: ReadonlySet<string>;
    onChoose: (bundleId: string) => void;
    onRemove: (bundleId: string) => void;
};

export const BundleCatalog = ({
    bundles,
    selectedBundleIds,
    includedBundleIds,
    disabledBundleIds,
    onChoose,
    onRemove,
}: Props) => {
    const [activeBundleId, setActiveBundleId] = useState<string | null>(null);

    const handleToggleDetails = useCallback((bundleId: string) => {
        setActiveBundleId((currentId) =>
            currentId === bundleId ? null : bundleId,
        );
    }, []);

    const handleCloseDetails = useCallback(() => {
        setActiveBundleId(null);
    }, []);

    useEffect(() => {
        if (
            activeBundleId !== null &&
            !bundles.some((bundle) => bundle.bundleId === activeBundleId)
        ) {
            setActiveBundleId(null);
        }
    }, [activeBundleId, bundles]);

    return (
        <BundleGrid
            bundles={bundles}
            activeBundleId={activeBundleId}
            selectedBundleIds={selectedBundleIds}
            includedBundleIds={includedBundleIds}
            disabledBundleIds={disabledBundleIds}
            onToggleDetails={handleToggleDetails}
            onCloseDetails={handleCloseDetails}
            onChoose={onChoose}
            onRemove={onRemove}
        />
    );
};
