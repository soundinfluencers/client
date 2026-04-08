import React, {useState} from "react";
import "./_promo-form.scss";

import { SubmitButton } from "@/components/ui/submit-button/submit-button";
import { toast } from "react-toastify";

import {
    BespokeArtistForm,
    BespokeEventForm,
    BespokeMusicForm,
    BespokeOtherForm,
} from "@/client-side/client-forms/bespoke";

import { postBespokeCampaign } from "@/api/client/campaign/campaign-bespoke";
import { buildBespokeSchema, buildPromoTabDefaultValues } from "@/client-side/schemas/schema-bespoke";
import type {
    BespokeCampaignTabId,
    BespokeFormValues
} from "@/client-side/pages/bespoke-campaign/model/bespoke-сampaign.types.ts";
import {
    buildBespokePayload,
    getBespokeTabData,
    mapTabToCategory
} from "@/client-side/pages/bespoke-campaign/model/bespoke-campaign.helpers.ts";
import {BESPOKE_CAMPAIGN_TABS_DATA} from "@/client-side/pages/bespoke-campaign/model/bespoke-campaign.constants.ts";
import type {IBespokeCampaignTabData} from "@/types/client/form-clients/bespoke-campaign-tabs-data.ts";
import {Modal} from "@/shared/ui/modal-fix/Modal.tsx";
import {ButtonMain} from "@/shared/ui";
import {useNavigate} from "react-router-dom";
import {BespokeForm} from "@components/form/agency-form.tsx";




interface Props {
    activeTabId: BespokeCampaignTabId;
}

const getFormViewByCategory = (category: ReturnType<typeof mapTabToCategory>) => {
    if (category === "artist") return BespokeArtistForm;
    if (category === "music") return BespokeMusicForm;
    if (category === "event") return BespokeEventForm;
    return BespokeOtherForm;
};

export const PromoForm: React.FC<Props> = ({ activeTabId }) => {
    const [popUp,setPopUp] = useState(false)
    const navigate = useNavigate();
    const category = React.useMemo(
        () => mapTabToCategory(activeTabId),
        [activeTabId],
    );

    const promoFormData = React.useMemo(
        () => getBespokeTabData(BESPOKE_CAMPAIGN_TABS_DATA, activeTabId),
        [activeTabId],
    );

    const schema = React.useMemo(
        () => buildBespokeSchema(category),
        [category],
    );

    const defaultValues = React.useMemo(
        () =>
            promoFormData ? buildPromoTabDefaultValues(promoFormData as IBespokeCampaignTabData) : {},
        [promoFormData],
    );

    const FormView = React.useMemo(
        () => getFormViewByCategory(category),
        [category],
    );

    const handleSubmit = React.useCallback(
        async (values: BespokeFormValues) => {
            const payload = buildBespokePayload(category, values);
            console.log(payload,'payload-bespoke');
            await postBespokeCampaign({
                category,
                payload,
            });
            setPopUp(true)
            toast.success("Agency campaign sent successfully.");
        },
        [category],
    );

    if (!promoFormData) return null;

    return (
        <div className="promo-form">
            {promoFormData.title && (
                <div className="promo-form__title">
                    <h2>{promoFormData.title}</h2>
                </div>
            )}

            <BespokeForm<BespokeFormValues>
                key={activeTabId}
                schema={schema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                submitButton={<SubmitButton
                    data={"Create"}
                    type="submit"
                    className="bespoke-btn"
                />}
                expose={(methods) => {
                    console.log("BESPOKE ERRORS", methods.formState.errors);
                }}
            >
                <FormView />



            </BespokeForm>
            {popUp &&
                <Modal onClose={() => setPopUp(false)}>
                    <div className="bespoke-modal">
                        <h2>Campaign submitted successfully</h2>
                        <h3>Thank you for submitting your campaign details.</h3>
                        <p>Our team is now reviewing your request and preparing a tailored campaign plan for your approval.</p>
                        <p>You can expect to hear from us within 12–48 hours — often sooner.</p>
                        <p>We’re looking forward to working with you.</p>


                        <ButtonMain
                            className="btn-bespoke"
                            text="Back to dashboard"
                            onClick={() => navigate("/")}
                        />
                    </div>
                </Modal>
            }
        </div>
    );
};