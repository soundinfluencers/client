import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Breadcrumbs, Container } from "@/components";
import { ButtonMain, ButtonSecondary } from "@/shared/ui";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import { NoData } from "@components/ui/no-array/no-data";
import { DraftButton } from "@components/ui/draft-button/draft-button.tsx";

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
import {
    parseProposalOptionCreateContext,
    PROPOSAL_OPTION_CREATE_MODE,
    isProposalOptionCreateRequested,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation.ts";
import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";

export const CampaignCreatorPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const resetBuilder = useCampaignBuilderStore((state) => state.actions.reset);

    const isAddInfluencerMode =
        searchParams.get("mode") === "add-influencer" &&
        searchParams.has("option");

    const optionIndex = Number(searchParams.get("option") ?? 0);
    const isProposalOptionCreateMode =
        isProposalOptionCreateRequested(searchParams);
    const proposalOptionCreateContext =
        parseProposalOptionCreateContext(searchParams);
    const hasInvalidProposalOptionCreateContext =
        isProposalOptionCreateMode && !proposalOptionCreateContext;

    React.useEffect(() => {
        if (!hasInvalidProposalOptionCreateContext) return;

        resetBuilder();
        navigate("/client/campaign", { replace: true });
    }, [
        hasInvalidProposalOptionCreateContext,
        navigate,
        resetBuilder,
    ]);

    const {
        selectedCurrency,
        selectedOfferId,
        selectedPromoCardIds,
        selectedBundles,
        totalPrice,
        displayCurrencySymbol,
        canProceed,
        handleProceed,
    } = useCampaignProceedSummary({
        mode: isAddInfluencerMode
            ? "add-influencer"
            : isProposalOptionCreateMode
                ? PROPOSAL_OPTION_CREATE_MODE
                : "create",
        optionIndex: isAddInfluencerMode ? optionIndex : null,
        proposalOptionCreateContext,
    });

    const currencySymbol = isAddInfluencerMode
        ? displayCurrencySymbol
        : selectedCurrency?.key ?? "€";

    const {
        selectedPlatformKey,
        setPlatform,
        selectedGenre,
        setSelectedGenre,
        offers,
        isLoading,
        isFetching,
        isError,
    } = useCampaignCreatorPage();

    const draft = useSaveCampaignCreatorDraft();

    const isEmpty = !isLoading && !isFetching && offers.length === 0;
    const canUseDrafts =
        !isAddInfluencerMode && !isProposalOptionCreateMode;

    if (hasInvalidProposalOptionCreateContext) return null;

    return (
        <Container className={styles.root}>
            <div className={styles.navmenu}>
                <Breadcrumbs />

                {canUseDrafts && (
                    <DraftButton onClick={draft.open} />
                )}
            </div>

            {!isAddInfluencerMode && (
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

            {isAddInfluencerMode && (
                <>
                    <h1>Ready-to-launch offers</h1>
                    {isError || isEmpty ? null : (
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
                            {totalPrice}
                            {currencySymbol}
                        </span>
                    </p>
                </div>

                <ButtonMain
                    className={styles.btn}
                    text="Proceed"
                    onClick={handleProceed}
                    isDisabled={!canProceed}
                />
            </div>

            <FooterSummary
                isAddInfluencerMode={isAddInfluencerMode}
                selectedCurrency={currencySymbol}
                selectedOfferId={selectedOfferId}
                selectedPromoCardIds={selectedPromoCardIds}
                selectedBundlesCount={selectedBundles.length}
                totalPrice={totalPrice}
                canProceed={canProceed}
                onProceed={handleProceed}
            />

            {canUseDrafts && draft.isOpen && (
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
                                text="Save"
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
