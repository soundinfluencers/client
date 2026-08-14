import React from "react";
import { ButtonMain } from "@/shared/ui";

import styles from "./campaign-offers-slider.module.scss";
import {
    useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import {
    mapOfferAccountToSelectedAccount,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-selection";
import type {PublishedOffer} from "@/entities/client-side/campaign-creator-page/offer/model/offer.types.ts";
import {
    useBuildCampaignParams,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params";

type Props = {
    offer: PublishedOffer;
};

export const OfferCard: React.FC<Props> = ({ offer }) => {
    const selectedOfferId = useCampaignBuilderStore((s) => s.selectedOfferId);
    const selectOffer = useCampaignBuilderStore((s) => s.actions.selectOffer);
    const { selectedCurrency, selectedCurrencyCode } = useBuildCampaignParams();
    const isActive = selectedOfferId === offer.id;
    const activePrice = offer.prices[selectedCurrencyCode];
    const onChoose = React.useCallback(() => {
        selectOffer(
            isActive
                ? {
                    offerId: null,
                    offerName: "",
                    offerPrice: undefined,
                    offerPrices: {},
                    currency: selectedCurrencyCode,
                    accountIds: [],
                    accounts: [],
                }
                : {
                    offerId: offer.id,
                    offerName: offer.title,
                    offerPrice: activePrice,
                    offerPrices: offer.prices,
                    currency: selectedCurrencyCode,
                    accountIds: offer.connectedAccounts.map((account) => account.accountId),
                    accounts: offer.connectedAccounts.map(
                        mapOfferAccountToSelectedAccount,
                    ),
                },
        );
    }, [
        activePrice,
        isActive,
        offer,
        selectOffer,
        selectedCurrencyCode,
    ]);

    return (
        <div className={`${styles.card} ${isActive ? styles.cardActive : ""}`}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleSection}>
                    <h2>{offer.title}</h2>
                    <p>
                        {activePrice ?? "—"}
                        {selectedCurrency.key}
                    </p>
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
