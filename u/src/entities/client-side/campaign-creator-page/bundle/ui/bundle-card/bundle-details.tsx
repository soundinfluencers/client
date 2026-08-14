import type {
  BundleAccountDisplayModel,
  BundleChipDisplayModel,
} from "./bundle-card.types";

import styles from "./bundle-card.module.scss";

type Props = {
  accounts: readonly BundleAccountDisplayModel[];
};

const DetailChips = ({
  label,
  values,
}: {
  label: string;
  values: readonly BundleChipDisplayModel[];
}) => {
  return (
    <div className={styles.detailGroup}>
      <h4>{label}</h4>
      <ul className={styles.chips}>
        {values.map((chip) => (
          <li key={chip.key}>{chip.label}</li>
        ))}
      </ul>
    </div>
  );
};

const BundleAccountDetails = ({
  account,
}: {
  account: BundleAccountDisplayModel;
}) => {
  return (
    <section className={styles.accountDetails}>
      <div className={styles.detailAccountHeader}>
        <h3>{account.username}</h3>

        <div className={styles.detailAccountMetrics}>
          {account.platformIcon && (
            <img
              src={account.platformIcon}
              alt={account.platformLabel}
            />
          )}
          <span>{account.followersLabel}</span>
          {account.priceLabel && <span>{account.priceLabel}</span>}
        </div>
      </div>

      <DetailChips label="Genres" values={account.genres}/>
      <DetailChips label="Countries" values={account.countries}/>
    </section>
  );
};

export const BundleDetails = ({ accounts }: Props) => {
  return (
    <div className={styles.details}>
      {accounts.map((account) => (
        <BundleAccountDetails
          key={account.accountId}
          account={account}
        />
      ))}
    </div>
  );
};
