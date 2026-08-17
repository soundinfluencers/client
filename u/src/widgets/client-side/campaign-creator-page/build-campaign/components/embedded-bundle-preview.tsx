import { BundleAccountsCompactList } from "@/entities/client-side/campaign-creator-page/bundle/ui/bundle-card/bundle-accounts-compact-list";
import { BundlePriceSummary } from "@/entities/client-side/campaign-creator-page/bundle/ui/bundle-card/bundle-price-summary";
import type {
    EmbeddedBundlePreviewDisplayModel,
} from "../model/network-bundle-preview.mappers";

import styles from "./embedded-bundle-preview.module.scss";

type Props = {
    previews: readonly EmbeddedBundlePreviewDisplayModel[];
    selectedBundleIds: ReadonlySet<string>;
    includedBundleIds: ReadonlySet<string>;
    pendingBundleIds: ReadonlySet<string>;
    disabledBundleIds: ReadonlySet<string>;
    onChooseBundle: (bundleId: string) => void;
};

export const EmbeddedBundlePreviewList = ({
    previews,
    selectedBundleIds,
    includedBundleIds,
    pendingBundleIds,
    disabledBundleIds,
    onChooseBundle,
}: Props) => {
    if (previews.length === 0) {
        return null;
    }

    return (
        <div className={styles.list}>
            {previews.map((preview) => {
                const isSelected = selectedBundleIds.has(
                    preview.bundleId,
                );
                const isPending = pendingBundleIds.has(
                    preview.bundleId,
                );
                const isIncludedInSelectedOffer = includedBundleIds.has(
                    preview.bundleId,
                );
                const chooseDisabled =
                    isSelected ||
                    isPending ||
                    isIncludedInSelectedOffer ||
                    disabledBundleIds.has(preview.bundleId);
                const buttonLabel = isPending
                    ? "Choosing..."
                        : isSelected
                            ? "Selected"
                            : "Choose Bundle";

                return (
                    <section
                        key={preview.bundleId}
                        className={styles.preview}
                        aria-label="Bundle preview"
                    >
                        <p className={styles.badge}>Part of Bundle</p>

                        <BundleAccountsCompactList
                            accounts={preview.accounts}
                            className={styles.accounts}
                        />

                        <BundlePriceSummary
                            priceLabel={preview.priceLabel}
                            originalPriceLabel={preview.originalPriceLabel}
                            className={styles.price}
                        />

                        {isIncludedInSelectedOffer && (
                            <p className={styles.includedText}>
                                Included in your selected offer
                            </p>
                        )}

                        <button
                            type="button"
                            className={styles.chooseButton}
                            disabled={chooseDisabled}
                            aria-busy={isPending}
                            onClick={() =>
                                onChooseBundle(preview.bundleId)
                            }
                        >
                            {buttonLabel}
                        </button>
                    </section>
                );
            })}
        </div>
    );
};
