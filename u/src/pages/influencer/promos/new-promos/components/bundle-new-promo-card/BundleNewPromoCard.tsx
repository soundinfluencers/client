import { getSocialMediaIcon } from "@/constants/social-medias";
import campaignMarker from "@/assets/logos/logo-main.svg";
import {
  ButtonMain,
  ButtonSecondary,
} from "@/components/ui/buttons-fix/ButtonFix";
import { DetailsRow } from "../../../components/promos-details-list/promos-details-list-card/DetailsRow";
import { getPromoFieldsBySocialMedia } from "../../../data/promos.data";
import { hasDisplayValue } from "../../../utils/promo-field-value";
import type {
  BundleNewPromo,
  BundlePromoAccount,
  TDetailsField,
} from "../../../types/promos.types";
import {
  formatFollowers,
  formatReward,
} from "../../utils/new-promos-formatters";

import "./_bundle-new-promo-card.scss";

interface Props {
  promo: BundleNewPromo;
  index: number;
  isPending?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

const isBundleAccountDetailField = ({ key }: TDetailsField): boolean =>
  key !== "username" && key !== "clientName";

const getBundleAccountFieldValue = (
  account: BundlePromoAccount,
  field: TDetailsField,
): unknown => {
  if (!(field.key in account)) {
    return undefined;
  }

  return account[field.key as keyof BundlePromoAccount];
};

const BundleAccountSummary = ({
  account,
  index,
  // currency,
}: {
  account: BundlePromoAccount;
  index: number;
  currency: string;
}) => {
  const platformIcon = getSocialMediaIcon(account.accountSocialMedia);

  return (
    <li className="bundle-new-promo-card__account-row">
      <span className="bundle-new-promo-card__account-identity">
        <span>{index + 1}.</span>
        <span>{account.username}</span>
      </span>
      <span className="bundle-new-promo-card__account-audience">
        {platformIcon && (
          <img
            className="bundle-new-promo-card__platform-icon"
            src={platformIcon}
            alt={account.accountSocialMedia}
          />
        )}
        <span>{formatFollowers(account.followers)}</span>
      </span>
      {/*<span className="bundle-new-promo-card__account-reward">*/}
      {/*  {formatReward(account.reward, currency)}*/}
      {/*</span>*/}
    </li>
  );
};

const BundleAccountBrief = ({ account }: { account: BundlePromoAccount }) => {
  const platformIcon = getSocialMediaIcon(account.accountSocialMedia);
  const fields = getPromoFieldsBySocialMedia(
    account.accountSocialMedia,
    "pending",
  ).filter(isBundleAccountDetailField);

  return (
    <section
      className="bundle-new-promo-card__brief"
      data-added-accounts-id={account.addedAccountsId}
    >
      <h3 className="bundle-new-promo-card__brief-title">
        {platformIcon && (
          <img
            className="bundle-new-promo-card__platform-icon"
            src={platformIcon}
            alt=""
          />
        )}
        <span>Brief {account.username}:</span>
      </h3>

      <div className="promos-details-list-card__body-details bundle-new-promo-card__brief-rows">
        {fields.map((field) => {
          const rawValue = getBundleAccountFieldValue(account, field);

          if (!hasDisplayValue(rawValue)) {
            return null;
          }

          return (
            <DetailsRow
              key={`${field.key}-${field.label}`}
              label={field.label}
              value={String(rawValue)}
              copyable={field.copyable}
              linkable={field.linkable}
              icon={field.icon}
            />
          );
        })}
      </div>
    </section>
  );
};

export const BundleNewPromoCard = ({
  promo,
  index,
  isPending = false,
  onAccept,
  onDecline,
}: Props) => {
  const bundleFee = formatReward(promo.bundleReward, promo.currency);

  return (
    <article className="promos-details-list-card bundle-new-promo-card">
      <div className="bundle-new-promo-card__main">
        <div className="promos-details-list-card__header">
          <span className="promos-details-list-card__number">#{index + 1}</span>
          <span className="promos-details-list-card__status">New bundle promo</span>
        </div>

        <div className="bundle-new-promo-card__content">
          <div className="bundle-new-promo-card__campaign">
            <span className="bundle-new-promo-card__campaign-marker" aria-hidden="true">
              <img src={campaignMarker} alt="" />
            </span>
            <h2>{promo.campaignName}</h2>
          </div>

          <div className="bundle-new-promo-card__details">
            <section className="bundle-new-promo-card__accounts">
              <p className="bundle-new-promo-card__section-label">
                Accounts in this bundle:
              </p>
              <ol className="bundle-new-promo-card__account-list">
                {promo.accounts.map((account, accountIndex) => (
                  <BundleAccountSummary
                    key={`${account.addedAccountsId}:${account.socialAccountId}`}
                    account={account}
                    index={accountIndex}
                    currency={promo.currency}
                  />
                ))}
              </ol>
            </section>

            <section className="bundle-new-promo-card__commercial">
              <p className="bundle-new-promo-card__pricing-note">
                The price of the bundle will change based on how many platforms you choose.
              </p>
              <div className="promos-details-list-card__body-details">
                {/*<DetailsRow*/}
                {/*  label="Total amount:"*/}
                {/*  value={formatReward(promo.originalReward, promo.currency)}*/}
                {/*/>*/}
                <DetailsRow label="Bundle fee:" value={bundleFee} />
                <DetailsRow label="Client" value={promo.clientName} />
              </div>
            </section>

            <div className="bundle-new-promo-card__briefs">
              {promo.accounts.map((account) => (
                <BundleAccountBrief
                  key={`${account.addedAccountsId}:${account.socialAccountId}:brief`}
                  account={account}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="bundle-new-promo-card__footer">
        <p className="bundle-new-promo-card__footer-fee">
          <span>Bundle fee:</span>
          <strong>{bundleFee}</strong>
        </p>
        <div className="promos-details-list-card__actions bundle-new-promo-card__actions">
          <ButtonSecondary
            label="Decline"
            onClick={onDecline}
            isDisabled={isPending || !onDecline}
          />
          <ButtonMain
            label="Accept bundle promo"
            onClick={onAccept}
            isDisabled={isPending || !onAccept}
          />
        </div>
      </footer>
    </article>
  );
};
