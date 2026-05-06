import React from "react";
import { ButtonMain } from "@/shared/ui";

import styles from "./campaign-offers-slider.module.scss";
import {
    useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import type {PublishedOffer} from "@/entities/client-side/campaign-creator-page/offer/model/offer.types.ts";

type Props = {
    offer: PublishedOffer;
};

export const OfferCard: React.FC<Props> = ({ offer }) => {
    const selectedOfferId = useCampaignBuilderStore((s) => s.selectedOfferId);
    const selectOffer = useCampaignBuilderStore((s) => s.actions.selectOffer);
    const isActive = selectedOfferId === offer.id;
    const onChoose = React.useCallback(() => {
        selectOffer(
            isActive
                ? {
                    offerId: null,
                    offerName: "",
                    offerPrice: 0,
                    accountIds: [],
                    accounts: [],
                }
                : {
                    offerId: offer.id,
                    offerName: offer.title,
                    offerPrice: Number(offer.price ?? 0),
                    accountIds: offer.connectedAccounts.map((account) => account.accountId),
                    accounts: offer.connectedAccounts.map((account) => ({
                        accountId: account.accountId,
                        influencerId: account.influencerId,
                        socialMedia: account.socialMedia,
                        username: account.username,
                        logoUrl: account.logoUrl,
                        profileType: account.profileType,
                        followers: account.followers,
                        dateRequest: "ASAP",
                    })),
                },
        );
    }, [selectOffer, isActive, offer]);

    return (
        <div className={`${styles.card} ${isActive ? styles.cardActive : ""}`}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleSection}>
                    <h2>{offer.title}</h2>
                    <p>{offer.price}€</p>
                </div>

                <ul>
                    <li>{offer.storyAndPostDetails}</li>
                    <li>{offer.networksAmount} networks with</li>
                    <li>{offer.combinedFollowers} Followers Combined</li>
                </ul>

                <ButtonMain
                    text="Choose"
                    onClick={onChoose}
                    className={styles.cardButton}
                />
            </div>

            <div className={styles.cardAccounts}>
                <ul>
                    {offer.connectedAccounts.map((account) => (
                        <li key={account.accountId}>
                            <img src={account.logoUrl} alt="" />
                            {account.username}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};