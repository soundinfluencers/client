import React from "react";
import { Breadcrumbs, Container } from "@/components";
import { ButtonMain, ButtonSecondary } from "@/shared/ui";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import { NoData } from "@components/ui/no-array/no-data";


import { useCampaignCreatorPage } from "../model/use-campaign-creator-page";
import { useSaveCampaignCreatorDraft } from "../model/use-save-campaign-creator-draft";

import { postCampaignDraft } from "@/api/client/campaign/draft.api";
import {DraftButton} from "@components/ui/draft-button/draft-button.tsx";



import styles from "./campaign-creator-page.module.scss";
import {PlatformScroll} from "@/features/client-side/campaign-creator-page/select-platform/ui/platform-scroll.tsx";
import {GenreScroll} from "@/features/client-side/campaign-creator-page/select-genre/ui/genre-scroll.tsx";
import {
    CampaignOffersSlider
} from "@/widgets/client-side/campaign-creator-page/campaign-offers-slider/ui/campaign-offers-slider.tsx";
import {BuildCampaign} from "@/widgets/client-side/campaign-creator-page/build-campaign/ui/build-campaign.tsx";
import {FooterSummary} from "@/widgets/client-side/campaign-creator-page/footer-summary/footer-summary.tsx";
import {useSearchParams} from "react-router-dom";

export const CampaignCreatorPage: React.FC = () => {
    const [searchParams] = useSearchParams();

    const isAddInfluencerMode =
        searchParams.get("mode") === "add-influencer" &&
        searchParams.has("option");

    const optionIndex = Number(searchParams.get("option") ?? 0);

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

    const draft = useSaveCampaignCreatorDraft({
        postCampaignDraft,
    });

    const isEmpty = !isLoading && !isFetching && offers.length === 0;

    return (
        <Container className={styles.root}>
            <div className={styles.navmenu}>
                <Breadcrumbs />

                {!isAddInfluencerMode && (
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

            <FooterSummary
                mode={isAddInfluencerMode ? "add-influencer" : "create"}
                optionIndex={isAddInfluencerMode ? optionIndex : null}
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
                                text="Save"
                                onClick={draft.save}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </Container>
    );
};