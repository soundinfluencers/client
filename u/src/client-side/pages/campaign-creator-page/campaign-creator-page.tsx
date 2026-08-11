import React from "react";
import "./campaign-creator-page.scss";

import { Breadcrumbs, Container } from "@/components";
import { NoData } from "@/components/ui/no-array/no-data";
import {
    BuildCampaign,
    Footer,
    ScrollGenres,
    ScrollPlatforms,
    SliderForCard,
} from "@/client-side/widgets";
import { useCampaignStore } from "@/client-side/store";
import { DraftButton } from "@/client-side/ui/draft-button/draft-button";
import { saveCampaignDraftByStep } from "@/client-side/utils/draft.helpers";
import { CampaignDraftLatestStep } from "@/client-side/types/draft.types";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { postCampaignDraft } from "@/api/client/campaign/draft.api";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import { ButtonMain, ButtonSecondary } from "@/shared/ui";
import {useCampaignCreatorPage} from "@/client-side/pages/campaign-creator-page/hooks/use-campaign-creator-page.ts";
import {useDraftSaveModal} from "@/client-side/hooks";


export const CampaignCreatorPage: React.FC = () => {
    const navigate = useNavigate();
    const store = useCampaignStore();
    const actions = useCampaignStore((s) => s.actions);

    const {
        selectedPlatform,
        setPlatform,
        selectedGenre,
        setSelectedGenre,
        offers,
        isLoading,
        isFetching,
        isError,
    } = useCampaignCreatorPage();

    const {
        isOpen: draftModal,
        draftName,
        setDraftName,
        open: openDraftModal,
        close: closeDraftModal,
    } = useDraftSaveModal();

    const onSaveDraft = async () => {
        try {
            await saveCampaignDraftByStep({
                step: CampaignDraftLatestStep.addAccounts,
                state: store,
                actions,
                campaignName: draftName,
                navigate,
                postCampaignDraft,
            });

            toast.success("Draft saved successfully!");
            closeDraftModal();
        } catch (error: any) {
            toast.error(error?.message || "Failed to save draft");
        }
    };

    return (
        <Container className="campaign-creator-page">
            <div className="navmenu">
                <Breadcrumbs />
                <DraftButton onClick={openDraftModal} />
            </div>

            <h1>Ready-to-launch offers</h1>

            <div className="campaign-creator-page__head">
                <ScrollPlatforms
                    selectedPlatform={selectedPlatform}
                    onPlatformSelect={setPlatform}
                />

                <ScrollGenres
                    selectedGenre={selectedGenre}
                    onGenreSelect={setSelectedGenre}
                />
            </div>

            {isLoading || isFetching ? (
                <SliderForCard isLoading={true} offers={[]} />
            ) : isError ? (
                <NoData>
                    <h2>No offers available for this genre right now</h2>
                    <p>
                        You can still move forward by using Build Your Custom Campaign to
                        create a multi <br />-platform promotion tailored to your needs.
                    </p>
                </NoData>
            ) : offers.length === 0 ? (
                <NoData>
                    <h2>No offers available for this genre right now</h2>
                    <p>
                        You can still move forward by using Build Your Custom Campaign to
                        create a multi <br />-platform promotion tailored to your needs.
                    </p>
                </NoData>
            ) : (
                <SliderForCard isLoading={false} offers={offers} />
            )}

            <BuildCampaign />
            <Footer />

            {draftModal && (
                <Modal onClose={closeDraftModal}>
                    <div className="create-option">
                        <h2>Save draft</h2>
                        <input
                            className="create-option-input"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            placeholder="Enter draft name"
                        />

                        <div className="create-option-btn">
                            <ButtonSecondary
                                className="btn"
                                text="Cancel"
                                onClick={closeDraftModal}
                            />
                            <ButtonMain
                                className="btn"
                                text="Save"
                                onClick={onSaveDraft}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </Container>
    );
};
