import React from "react";
import { useProposalAddInfluencer } from "@/pages/client-side/campaign-post-content/model/use-proposal-add-influencer";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
// import { priceForCurrency } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/calc-builder-total";
import { Link, useSearchParams } from "react-router-dom";

import { Breadcrumbs, Container, Loader } from "@/components";
import { ButtonMain, ButtonSecondary } from "@/shared/ui";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import { NoData } from "@components/ui/no-array/no-data";
import { DraftButton } from "@components/ui/draft-button/draft-button.tsx";

import { postCampaignDraft } from "@/entities/client-side/campaign-draft/api/campaign-draft.api";

import { useCampaignCreatorPage } from "../model/use-campaign-creator-page";
import { useSaveCampaignCreatorDraft } from "../model/use-save-campaign-creator-draft";

import styles from "./campaign-creator-page.module.scss";

import { PlatformScroll } from "@/features/client-side/campaign-creator-page/select-platform/ui/platform-scroll.tsx";
import { GenreScroll } from "@/features/client-side/campaign-creator-page/select-genre/ui/genre-scroll.tsx";

import {
    CampaignOffersSlider,
} from "@/widgets/client-side/campaign-creator-page/campaign-offers-slider/ui/campaign-offers-slider.tsx";

import {
    BuildCampaign,
} from "@/widgets/client-side/campaign-creator-page/build-campaign/ui/build-campaign.tsx";

import {
    FooterSummary,
} from "@/widgets/client-side/campaign-creator-page/footer-summary/footer-summary.tsx";

import {
    useCampaignProceedSummary,
} from "@/widgets/client-side/campaign-creator-page/build-campaign/model/use-campaign-proceed-summary.tsx";

export const CampaignCreatorPage: React.FC = () => {
    const [params] = useSearchParams();
    const add = useProposalAddInfluencer(params);
    if (add.requested && add.error) return <Container><Breadcrumbs/><p role="alert">{add.error}</p><Link to="/client">Back to dashboard</Link></Container>;
    if (add.requested && !add.ready) return <Loader/>;
    return <><CampaignCreatorPageContent /></>;
};
const CampaignCreatorPageContent: React.FC = () => {
    const offerAvailable = useCampaignBuilderStore((s) => s.selectedOfferIsAvailable);
    // const offerName = useCampaignBuilderStore((s) => s.selectedOfferName);
    // const offerPrices = useCampaignBuilderStore((s) => s.selectedOfferPrices);
    // const selectOffer = useCampaignBuilderStore((s) => s.actions.selectOffer);
    const [searchParams] = useSearchParams();

    const isAddInfluencerMode =
        searchParams.get("mode") === "add-influencer" &&
        searchParams.has("option");

    const optionIndex = Number(searchParams.get("option") ?? 0);

    const {
        selectedCurrency,
        selectedOfferId,
        selectedPromoCardIds,
        totalPrice,
        totalPriceReady,
        canProceed,
        handleProceed,
    } = useCampaignProceedSummary({
        mode: isAddInfluencerMode ? "add-influencer" : "create",
        optionIndex: isAddInfluencerMode ? optionIndex : null,
    });

    const currencySymbol = selectedCurrency?.key ?? "€";

    const {
        selectedPlatformKey,
        setPlatform,
        selectedGenre,
        setSelectedGenre,
        offers,
        isLoading,
        isFetching,
        isError,
        // refetch,
    } = useCampaignCreatorPage();

    const draft = useSaveCampaignCreatorDraft({
        postCampaignDraft,
    });

    const isEmpty = !isLoading && !isFetching && offers.length === 0;

    return (
        <Container className={styles.root}>
            {/*{!isAddInfluencerMode && selectedOfferId && offerAvailable !== false && <p>*/}
            {/*    Selected offer: {offerName || "Selected offer"} — {priceForCurrency(offerPrices, selectedCurrency.currency) === null ? `Price unavailable in ${selectedCurrency.currency}` : `${priceForCurrency(offerPrices, selectedCurrency.currency)}${currencySymbol}`}*/}
            {/*</p>}*/}
            {/*{!isAddInfluencerMode && <button type="button" onClick={() => void refetch()}>Refresh catalogue</button>}*/}
            {/*{!isAddInfluencerMode && offerAvailable === false && <div role="alert">*/}
            {/*    <p>{offerName || "Saved offer"} is unavailable or has changed. Review the catalogue and select another offer, or explicitly remove this selection.</p>*/}
            {/*    <button type="button" onClick={() => selectOffer({ offerId: null })}>Remove unavailable offer</button>*/}
            {/*</div>}*/}
            <div className={styles.navmenu}>
                <Breadcrumbs />

                {!isAddInfluencerMode && (
                    <DraftButton onClick={draft.open} />
                )}
            </div>

            {(
                <>
                    <h1>Ready-to-launch offers</h1>

                    <div className={styles.head}>
                        <PlatformScroll
                            selectedPlatformKey={selectedPlatformKey}
                            onPlatformSelect={setPlatform}
                        />

                        <GenreScroll
                            selectedGenre={selectedGenre}
                            selectedPlatform={selectedPlatformKey}
                            onGenreSelect={setSelectedGenre}
                        />
                    </div>

                    {isError || isEmpty ? (
                        <NoData>
                            <h2>No offers available for this genre right now</h2>
                            <p>
                                You can still move forward by using Build Your Custom Campaign to
                                create a multi-platform promotion tailored to your needs.
                            </p>
                        </NoData>
                    ) : (
                        <CampaignOffersSlider
                            isLoading={isFetching || isLoading}
                            offers={offers}
                        />
                    )}
                </>
            )}

            <BuildCampaign />

            <div className={styles.proceed}>
                <div className={styles.proceedTotal}>

                    <p>
                        Total:{" "}
                        <span>
                            {offerAvailable === false ? "Review unavailable offer" : !totalPriceReady ? "Prices unavailable for the selected currency" : `${totalPrice}${currencySymbol}`}
                        </span>
                    </p>
                </div>

                <ButtonMain
                    className={styles.btn}
                    text={isAddInfluencerMode ? "Add account" : "Proceed"}
                    onClick={handleProceed}
                    isDisabled={!canProceed}
                />
            </div>

            <FooterSummary
                isAddInfluencerMode={isAddInfluencerMode}
                selectedCurrency={currencySymbol}
                selectedOfferId={selectedOfferId}
                selectedPromoCardIds={selectedPromoCardIds}
                totalPrice={totalPrice}
                totalPriceReady={totalPriceReady}
                canProceed={canProceed}
                offerAvailable={isAddInfluencerMode ? undefined : offerAvailable}
                onProceed={handleProceed}
            />

            {!isAddInfluencerMode && draft.isOpen && (
                <Modal onClose={draft.close}>
                    <div className={styles.createOption}>
                        <h2>Save draft</h2>

                        <input
                            className={styles.createOptionInput}
                            value={draft.draftName}
                            onChange={(e) => draft.setDraftName(e.target.value)}
                            placeholder="Enter draft name"
                        />

                        <div className={styles.createOptionButtons}>
                            <ButtonSecondary
                                className={styles.btn}
                                text="Cancel"
                                onClick={draft.close}
                            />

                            <ButtonMain
                                className={styles.btn}
                                text={draft.isSaving ? "Saving…" : "Save"}
                                onClick={draft.save}
                                isDisabled={draft.isSaving}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </Container>
    );
};
