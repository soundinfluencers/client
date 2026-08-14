import styles from "./bundle-card.module.scss";

type Props = {
    priceLabel: string | null;
    originalPriceLabel: string | null;
    className?: string;
};

export const BundlePriceSummary = ({
    priceLabel,
    originalPriceLabel,
    className,
}: Props) => {
    return (
        <div className={`${styles.priceSummary} ${className ?? ""}`}>
            <span>Price</span>

            <span className={styles.priceValues}>
                {originalPriceLabel && <del>{originalPriceLabel}</del>}
                {priceLabel && <strong>{priceLabel}</strong>}
            </span>
        </div>
    );
};
