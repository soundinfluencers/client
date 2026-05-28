import React from "react";
import { useNavigate } from "react-router-dom";
import { SubmitButton } from "@/components";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import { ButtonMain } from "@/shared/ui";
import { BespokeForm } from "@components/form/agency-form";
import { CampaignTextInput, CampaignTextArea } from "@components/form/input-post-content";
import { BudgetField } from "@components/ui/inputs/budget-input/budget-input";

import styles from "./agency-campaign-form.module.scss";
import type {
    AgencyCampaignTabId,
    AgencyFormField, AgencyFormValues
} from "@/entities/client-side/agency-campaign/model/agency-campaign.types.ts";
import {mapTabToCategory} from "@/entities/client-side/agency-campaign/model/agency-campaign.helpers.ts";
import { AGENCY_CAMPAIGN_FORM_CONFIGS } from "@/entities/client-side/agency-campaign/model/agency-campaign.constants";
import {buildAgencyCampaignSchema} from "@/entities/client-side/agency-campaign/model/agency-campaign.schema.ts";
import {
    useSubmitAgencyCampaign
} from "@/features/client-side/agency-campaign/submit-agency-campaign/model/use-submit-agency-campaign.ts";
import {
    AgencyCampaignTabBar
} from "@/features/client-side/agency-campaign/select-agency-campaign-tab/ui/agency-campaign-tab-bar.tsx";

type Props = {
    activeTab: AgencyCampaignTabId;
    onTabChange: (tab: AgencyCampaignTabId) => void;
};

const renderField = (field: AgencyFormField) => {
    if (field.type === "budget") {
        return (
            <BudgetField
                key={field.name}
                name={field.name}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
            />
        );
    }

    if (field.type === "textarea") {
        return (
            <CampaignTextArea
                key={field.name}
                name={field.name as any}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                className="agency-text-area"
                isbespoke={field.isBespoke}
            />
        );
    }

    return (
        <CampaignTextInput
            key={field.name}
            name={field.name as any}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
        />
    );
};

export const AgencyCampaignForm = ({ activeTab, onTabChange }: Props) => {
    const navigate = useNavigate();
    const category = React.useMemo(() => mapTabToCategory(activeTab), [activeTab]);

    const formConfig = React.useMemo(
        () => AGENCY_CAMPAIGN_FORM_CONFIGS.find((item) => item.tabId === activeTab) ?? null,
        [activeTab],
    );

    const schema = React.useMemo(
        () => buildAgencyCampaignSchema(category),
        [category],
    );

    const defaultValues = React.useMemo(() => {
        if (!formConfig) return {};

        const result: Record<string, string> = {};

        formConfig.fields.forEach((field) => {
            result[field.name] = "";
            if (field.type === "budget") {
                result["Your budget currency"] = "£";
            }
        });

        return result;
    }, [formConfig]);

    const { submit, isSuccessOpen, closeSuccess } = useSubmitAgencyCampaign();

    const handleSubmit = React.useCallback(
        async (values: AgencyFormValues) => {
            await submit(category, values);
        },
        [category, submit],
    );

    if (!formConfig) return null;

    return (
        <div className={styles.root}>
            <AgencyCampaignTabBar activeTab={activeTab} onChange={onTabChange} />

            <div className={styles.content}>
                {formConfig.title && (
                    <div className={styles.formTitle}>
                        <h2>{formConfig.title}</h2>
                    </div>
                )}

                <BespokeForm<AgencyFormValues>
                    key={activeTab}
                    schema={schema}
                    defaultValues={defaultValues}
                    onSubmit={handleSubmit}
                    submitButton={
                        <SubmitButton
                            data="Create"
                            type="submit"
                            className={styles.submitButton}
                        />
                    }
                >
                    <div className={styles.fields}>
                        {formConfig.fields.map(renderField)}
                    </div>
                </BespokeForm>
            </div>

            {isSuccessOpen && (
                <Modal onClose={closeSuccess}>
                    <div className={styles.successModal}>
                        <h2>Campaign submitted successfully</h2>
                        <h3>Thank you for submitting your campaign details.</h3>
                        <p>
                            Our team is now reviewing your request and preparing a tailored
                            campaign plan for your approval.
                        </p>
                        <p>
                            You can expect to hear from us within 12–48 hours — often sooner.
                        </p>
                        <p>We’re looking forward to working with you.</p>

                        <ButtonMain
                            className={styles.successButton}
                            text="Back to dashboard"
                            onClick={() => navigate("/")}
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};