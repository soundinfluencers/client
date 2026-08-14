import React from "react";
import styles from "./campaign-post-content-selection.module.scss";
import type {
    CampaignPostContentAccount,
    CampaignPostContentBundleSummary,
} from "../model/campaign-post-content.types";
import { normalizeSocial } from "../model/campaign-post-content.helpers";
import offerIcon from "@/assets/icons/multi.png";
import { formatFollowers } from "@/utils/functions/formatFollowers.ts";
import { getSocialMediaIconPostContent } from "@/constants/social-medias.ts";
import { formatCurrency } from "@/shared/functions/formatCurrency.ts";
import type { SocialMediaType } from "@/shared/types/utils/constants.types.ts";

type Props = {
    accounts: CampaignPostContentAccount[];
    offerAccounts: CampaignPostContentAccount[];
    bundles: CampaignPostContentBundleSummary[];
    manualAccounts: CampaignPostContentAccount[];
    offerName?: string;
    totalPrice: number;
    onEditSelection: () => void;
    offerPrice: number;
    currency?: string;
};

type SelectionGroup = {
    key: string;
    title: string;
    socialMedia: string;
    items: CampaignPostContentAccount[];
};

// const formatPrice = (value?: number | string) => {
//     if (value === undefined || value === null || value === "") return "";
//     return `${value}€`;
// };

const formatBundlePrice = (
    value: number | undefined,
    currency?: string,
) => {
    if (value === undefined) return "—";
    return formatCurrency(value, currency);
};

export const CampaignPostContentSelection: React.FC<Props> = ({
                                                                   offerAccounts,
                                                                   bundles,
                                                                   manualAccounts,
                                                                  offerName,
                                                                  totalPrice,
                                                                  onEditSelection,offerPrice,currency
                                                              }) => {
    const offerGroups: SelectionGroup[] = [
        {
            key: "offer-instagram-creators",
            title: "Instagram Creators",
            socialMedia: "instagram",
            items: offerAccounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "instagram" &&
                    item.profileType === "creator",
            ),
        },
        {
            key: "offer-instagram-communities",
            title: "Instagram Communities",
            socialMedia: "instagram",
            items: offerAccounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "instagram" &&
                    item.profileType === "community",
            ),
        },
        {
            key: "offer-tiktok-creators",
            title: "TikTok Creators",
            socialMedia: "tiktok",
            items: offerAccounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "tiktok" &&
                    item.profileType === "creator",
            ),
        },
        {
            key: "offer-tiktok-communities",
            title: "TikTok Communities",
            socialMedia: "tiktok",
            items: offerAccounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "tiktok" &&
                    item.profileType === "community",
            ),
        },
        {
            key: "offer-facebook",
            title: "Facebook",
            socialMedia: "facebook",
            items: offerAccounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "facebook",
            ),
        },
        {
            key: "offer-youtube",
            title: "YouTube",
            socialMedia: "youtube",
            items: offerAccounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "youtube",
            ),
        },
        {
            key: "offer-spotify",
            title: "Spotify",
            socialMedia: "spotify",
            items: offerAccounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "spotify",
            ),
        },
        {
            key: "offer-soundcloud",
            title: "SoundCloud",
            socialMedia: "soundcloud",
            items: offerAccounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "soundcloud",
            ),
        },
        {
            key: "offer-press",
            title: "Press",
            socialMedia: "press",
            items: offerAccounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "press",
            ),
        },
    ].filter((group) => group.items.length > 0);

    const manualGroups: SelectionGroup[] = [
        {
            key: "instagram-creators",
            title: "Instagram Creators",
            socialMedia: "instagram",
            items: manualAccounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "instagram" &&
                    item.profileType === "creator",
            ),
        },
        {
            key: "instagram-communities",
            title: "Instagram Communities",
            socialMedia: "instagram",
            items: manualAccounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "instagram" &&
                    item.profileType === "community",
            ),
        },
        {
            key: "tiktok-creators",
            title: "TikTok Creators",
            socialMedia: "tiktok",
            items: manualAccounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "tiktok" &&
                    item.profileType === "creator",
            ),
        },
        {
            key: "tiktok-communities",
            title: "TikTok Communities",
            socialMedia: "tiktok",
            items: manualAccounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "tiktok" &&
                    item.profileType === "community",
            ),
        },
        {
            key: "facebook",
            title: "Facebook",
            socialMedia: "facebook",
            items: manualAccounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "facebook",
            ),
        },
        {
            key: "youtube",
            title: "YouTube",
            socialMedia: "youtube",
            items: manualAccounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "youtube",
            ),
        },
        {
            key: "spotify",
            title: "Spotify",
            socialMedia: "spotify",
            items: manualAccounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "spotify",
            ),
        },
        {
            key: "soundcloud",
            title: "SoundCloud",
            socialMedia: "soundcloud",
            items: manualAccounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "soundcloud",
            ),
        },
        {
            key: "press",
            title: "Press",
            socialMedia: "press",
            items: manualAccounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "press",
            ),
        },
    ].filter((group) => group.items.length > 0);

    const renderAccountRow = (item: CampaignPostContentAccount) => {
        return (
            <div key={item.accountId} className={styles.accountRow}>
                <div className={styles.accountMain}>
                    {item.logoUrl ? <img src={item.logoUrl} alt="" /> : null}

                    <div className={styles.accountInfo}>
                        <p>{item.username}</p>
                    </div>
                </div>

                <div className={styles.accountMeta}>
                    {item.followers !== 0 && <span>{formatFollowers(item.followers || 0)} followers</span>}
                </div>

                <div className={styles.accountPrice}>
                    <span>{formatBundlePrice(item.price, currency)}</span>
                </div>
            </div>
        );
    };

    const renderGroup = (group: SelectionGroup,isOffer?: boolean) => (
        <section key={group.key} className={styles.groupSection}>
            {!isOffer && (
                <div className={styles.groupHeader}>
                    <img
                        src={
                            getSocialMediaIconPostContent(
                                group.socialMedia as SocialMediaType,
                            ) || ""
                        }
                        alt=""
                    />
                    <h4>{group.title}</h4>
                </div>
            )}

            <div className={styles.groupBody}>
                {group.items.map(renderAccountRow)}
            </div>
        </section>
    );

    return (
        <aside className={styles.selection}>
            <div className={styles.selectionHead}>
                <h3>Your Selection</h3>

                <button type="button" onClick={onEditSelection}>
                    Edit Selection
                </button>
            </div>

            <div className={styles.selectionContent}>
                {!!offerGroups.length && (
                    <section className={styles.offerSection}>
                        <div className={styles.offerHeader}>
                            <div className={styles.offerHeader__title}>
                                <img src={offerIcon} alt="" />
                                <h4>Offer: <span>{offerName || "Selected offer"}</span></h4>
                            </div>

                            <div>
                                <span>{formatBundlePrice(offerPrice, currency)}</span>
                            </div>
                        </div>

                        <div className={styles.offerBody}>
                            {offerGroups.map((group) => renderGroup(group, true))}
                        </div>
                    </section>
                )}

                {!!bundles.length && (
                    <div className={styles.bundleSections}>
                        {bundles.map((bundle) => (
                            <section
                                key={bundle.bundleId}
                                className={styles.bundleSection}
                            >
                                <div className={styles.bundleHeader}>
                                    <h4>Bundle</h4>

                                    <div className={styles.bundlePrice}>
                                        <span>Price</span>

                                        <span className={styles.bundlePriceValues}>
                                            {bundle.originalPrice !== undefined && (
                                                <del>
                                                    {formatBundlePrice(
                                                        bundle.originalPrice,
                                                        currency,
                                                    )}
                                                </del>
                                            )}
                                            <strong>
                                                {formatBundlePrice(
                                                    bundle.currentPrice,
                                                    currency,
                                                )}
                                            </strong>
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.bundleAccountsWrap}>
                                    <ul className={styles.bundleAccounts}>
                                        {bundle.accounts.map((account) => {
                                            const platformIcon =
                                                getSocialMediaIconPostContent(
                                                    account.socialMedia as SocialMediaType,
                                                );

                                            return (
                                                <li
                                                    key={account.accountId}
                                                    className={styles.bundleAccount}
                                                >
                                                    <span
                                                        className={
                                                            styles.bundleUsername
                                                        }
                                                    >
                                                        {account.username}
                                                    </span>

                                                    <span
                                                        className={
                                                            styles.bundleAccountPlatform
                                                        }
                                                    >
                                                        {platformIcon && (
                                                            <img
                                                                src={platformIcon}
                                                                alt={
                                                                    account.socialMedia
                                                                }
                                                            />
                                                        )}
                                                        <span>
                                                            {formatFollowers(
                                                                account.followers,
                                                            )}
                                                        </span>
                                                    </span>

                                                    <span
                                                        className={
                                                            styles.bundleAccountPrice
                                                        }
                                                    >
                                                        {formatBundlePrice(
                                                            account.price,
                                                            currency,
                                                        )}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                {!!manualGroups.length && (
                    <div className={styles.manualSections}>
                        {manualGroups.map((group) => renderGroup(group, false))}
                    </div>
                )}
            </div>

            <div className={styles.selectionFooter}>
                <h2>Total price: {totalPrice}{currency}</h2>
            </div>
        </aside>
    );
};
