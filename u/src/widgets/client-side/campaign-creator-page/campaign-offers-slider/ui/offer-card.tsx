import React from "react";
import { ButtonMain } from "@/shared/ui";

import styles from "./campaign-offers-slider.module.scss";
import {
    useCampaignBuilderStore
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import type {PublishedOffer} from "@/entities/client-side/campaign-creator-page/offer/model/offer.types.ts";
import { usePlatformParam } from "@/features/client-side/campaign-creator-page/select-platform/model/use-platform-param";
import { useGenreParam } from "@/features/client-side/campaign-creator-page/select-genre/model/use-genre-param";
import { useBuildCampaignParams } from "@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params";
import { priceForCurrency } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/calc-builder-total";

type Props = {
    offer: PublishedOffer;
};

export const OfferCard: React.FC<Props> = ({ offer }) => {
    const { platform, platformKey } = usePlatformParam();
    const { genre } = useGenreParam(platformKey);
    const selectedOfferId = useCampaignBuilderStore((s) => s.selectedOfferId);
    const selectedPrices = useCampaignBuilderStore((s) => s.selectedOfferPrices);
    const selectedAvailable = useCampaignBuilderStore((s) => s.selectedOfferIsAvailable);
    const { selectedCurrency } = useBuildCampaignParams();
    const price = priceForCurrency(selectedOfferId === offer.id && selectedPrices ? selectedPrices : offer.prices, selectedCurrency.currency);
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
                    catalogContext: { platform, genre },
                    offerName: offer.title,
                    offerPrices: { ...offer.prices },
                    accountIds: offer.connectedAccounts.map((account) => account.accountId),
                    accounts: offer.connectedAccounts.map((account) => ({
                        accountId: account.accountId,
                        influencerId: account.influencerId,
                        socialMedia: account.socialMedia,
                        username: account.username,
                        logoUrl: account.logoUrl,
                        profileType: account.profileType,
                        followers: account.followers,
                        prices: { ...account.prices },
                        ...(account.countries ? { countries: account.countries.map((country) => ({ ...country })) } : {}),
                        ...Object.fromEntries((["communityMusicGenres", "communityThemeTopics", "creatorMusicGenres", "creatorContentFocus"] as const)
                            .filter((key) => account[key] !== undefined).map((key) => [key, [...account[key]!]])),
                        dateRequest: "ASAP",
                    })),
                },
        );
    }, [selectOffer, isActive, offer, platform, genre]);

    return (
        <div className={`${styles.card} ${isActive ? styles.cardActive : ""}`}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleSection}>
                    <h2>{offer.title}</h2>
                    <p>{isActive && selectedAvailable === false ? "Saved offer selection unavailable — review selection" : price === null ? `Price unavailable in ${selectedCurrency.currency}` : `${price}${selectedCurrency.key}`}</p>
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
