import React from "react";
import "./_campaign-post-content.scss";

import {
    Breadcrumbs,
    ButtonSecondary,
    Container,
    SubmitButton,
} from "@/components";

import { Selection } from "@/client-side/widgets";
import { platformFormsMap } from "@/client-side/constants/plattforms-data-form";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";

import {
    AdditionalPlatformForm,
    PlatformForm,
} from "@/client-side/client-forms";

import { DraftButton } from "@/client-side/ui/draft-button/draft-button";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import { ButtonMain } from "@/shared/ui";

import { campaignPostContentSchema } from "@/client-side/schemas";

import { useCampaignPostContentPage } from "./hooks/use-campaign-post-content-page";
import { useCampaignPostContentDraft } from "./hooks/use-campaign-post-content-draft";
import { CampaignPostContentForm } from "@components/form/form-post-content.tsx";
import { CampaignTextInput } from "@components/form/input-post-content.tsx";
import type { UseFormReturn } from "react-hook-form";

type GroupKey = "main" | "music" | "press";

export const CampaignPostContent: React.FC = () => {
    const {
        offer,
        promoCard,
        totalPrice,
        postContentDraft,
        grouped,
        selectedPlatforms,
        saveDraftFormValues,
        handleSubmit,
        additionalSelection,
        toggleAdditionalSelection,
        addAdditionalForm,
        groupAdditionalByGroup,
        getAdditionalIndex,
        getFormPrefix,
        removeAdditionalForm,
        pageTitle,
    } = useCampaignPostContentPage();

    const [formMethods, setFormMethods] = React.useState<UseFormReturn<Record<string, string>> | null>(null);

    const {
        draftModal,
        draftName,
        setDraftName,
        openDraftModal,
        closeDraftModal,
        onSaveDraft,
    } = useCampaignPostContentDraft({
        postContentDraft,
        grouped,
        selectedPlatforms,
    });

    const unregisterFormPrefix = React.useCallback(
        (prefix: string) => {
            if (!formMethods) return;

            const values = formMethods.getValues();
            const keys = Object.keys(values).filter((key) =>
                key.startsWith(`${prefix}-`),
            );

            keys.forEach((key) => {
                formMethods.unregister(key);
                formMethods.clearErrors(key);
            });
        },
        [formMethods],
    );

    const renderGroup = (group: GroupKey) => {
        const platforms = grouped[group] as SocialMediaType[];
        if (!platforms?.length) return null;

        const baseForm = platformFormsMap[group];
        const additional = groupAdditionalByGroup[group];
        const basePrefix = `${group}-0`;
        const canAddAdditional = group !== "press";

        return (
            <div key={group} className="platform-group">
                <PlatformForm
                    data={baseForm}
                    selectedPlatforms={platforms}
                    formPrefix={basePrefix}
                />

                {additional.map((form) => {
                    const index = getAdditionalIndex(form.id);
                    const prefix = getFormPrefix(form);

                    return (
                        <React.Fragment key={form.id}>
                            <AdditionalPlatformForm
                                data={{
                                    ...baseForm,
                                    _id: form.id,
                                    platform: group,
                                    socialMedia: form.socialMedia,
                                }}
                                index={index}
                                formPrefix={prefix}
                                onRemove={() => {
                                    unregisterFormPrefix(prefix);
                                    removeAdditionalForm(form.id, prefix);
                                }}
                            />
                        </React.Fragment>
                    );
                })}

                {canAddAdditional && (
                    <>
                        <ButtonSecondary
                            className="additional-button"
                            text={`Add another ${baseForm.contentTitle}`}
                            onClick={() => {
                                if (platforms.length === 1) {
                                    addAdditionalForm(group, platforms[0] as SocialMediaType);
                                    return;
                                }

                                toggleAdditionalSelection(group);
                            }}
                        />

                        {additionalSelection === group && platforms.length > 1 && (
                            <div className="additional-selection">
                                <p>Choose the platform for additional post brief</p>
                                <ul>
                                    {platforms.map((platform) => (
                                        <li
                                            key={platform}
                                            onClick={() =>
                                                addAdditionalForm(group, platform as SocialMediaType)
                                            }
                                        >
                                            <img
                                                src={getSocialMediaIcon(platform) || ""}
                                                alt={platform}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <Container className="campaign-post-content">
            <div className="navmenu postNav">
                <Breadcrumbs />
                <DraftButton onClick={openDraftModal} />
            </div>

            <div className="campaign-post-content__row">
                <div className="form-block">
                    <div className="form-block__sticky">
                        <div className="form-block__header">
                            <h1>{pageTitle}</h1>
                        </div>

                        <CampaignPostContentForm<Record<string, string>>
                            schema={campaignPostContentSchema}
                            className="form-width"
                            onSubmit={handleSubmit}
                            onValuesChange={saveDraftFormValues}
                            defaultValues={postContentDraft ?? {}}
                            expose={(methods) => {
                                setFormMethods(methods);
                            }}
                            renderSubmit={() => (
                                <SubmitButton
                                    className="submit"
                                    data="Continue"
                                    type="submit"
                                />
                            )}
                        >
                            <CampaignTextInput
                                id="campaignName"
                                label="Campaign name"
                                name="campaignName"
                                placeholder="Enter campaign name"
                                required
                            />

                            {renderGroup("main")}
                            {renderGroup("music")}
                            {renderGroup("press")}
                        </CampaignPostContentForm>
                    </div>
                </div>

                <Selection
                    offer={offer}
                    promoCard={promoCard}
                    totalPrice={totalPrice}
                />
            </div>

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