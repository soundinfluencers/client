import { useState } from "react";
import { toast } from "react-toastify";
import type {
    AgencyCampaignCategory,
    AgencyFormValues
} from "@/entities/client-side/agency-campaign/model/agency-campaign.types.ts";
import {buildAgencyCampaignPayload} from "@/entities/client-side/agency-campaign/model/agency-campaign.helpers.ts";
import {postAgencyCampaign} from "@/entities/client-side/agency-campaign/api/agency-campaign.api.ts";



export const useSubmitAgencyCampaign = () => {
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async (
        category: AgencyCampaignCategory,
        values: AgencyFormValues,
    ) => {
        try {
            setIsSubmitting(true);

            const requestBody = buildAgencyCampaignPayload(category, values);
            await postAgencyCampaign(requestBody);

            setIsSuccessOpen(true);
            toast.success("Agency campaign sent successfully.");
        } catch (error) {
            toast.error("Failed to send agency campaign.");
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        submit,
        isSubmitting,
        isSuccessOpen,
        openSuccess: () => setIsSuccessOpen(true),
        closeSuccess: () => setIsSuccessOpen(false),
    };
};