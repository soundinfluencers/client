import type {
    BundleCompactAccountDisplayModel,
} from "./bundle-card.types";

import styles from "./bundle-card.module.scss";

type Props = {
    accounts: readonly BundleCompactAccountDisplayModel[];
    className?: string;
};

export const BundleAccountsCompactList = ({
    accounts,
    className,
}: Props) => {
    return (
        <ul
            className={`${styles.compactAccounts} ${className ?? ""}`}
        >
            {accounts.map((account) => (
                <li key={account.accountId} className={styles.compactAccount}>
                    <span className={styles.compactUsername}>
                        {account.username}
                    </span>

                    <span className={styles.compactMetrics}>
                        {account.platformIcon && (
                            <img
                                src={account.platformIcon}
                                alt={account.platformLabel}
                            />
                        )}
                        <span>{account.followersLabel}</span>
                        {account.priceLabel && (
                            <span>{account.priceLabel}</span>
                        )}
                    </span>
                </li>
            ))}
        </ul>
    );
};
