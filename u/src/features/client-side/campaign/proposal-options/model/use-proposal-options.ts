import React from "react";
import { toast } from "react-toastify";

import {
    deleteProposalOption,
    postProposalSystem,
} from "@/entities/client-side/campaign/api/proposal-system.api";

import {
    getProposalCampaignOption,
} from "@/entities/client-side/campaign/api";

import { useCampaignStore } from "@/entities/client-side/campaign/store/campaign.store";

import {
    getNextAvailableOptionIndex,
    getNextOptionAfterDelete,
    writeLastProposalOption,
} from "./proposal-options.helpers";

type Params = {
    onAfterChange?: () => void;
};

export const useProposalOptions = ({ onAfterChange }: Params = {}) => {
    const editable = useCampaignStore((s) => s.editable);
    const initCampaign = useCampaignStore((s) => s.initCampaign);
    const buildSavePayload = useCampaignStore((s) => s.buildSavePayload);

    const [isCreating, setIsCreating] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isSwitching, setIsSwitching] = React.useState(false);

    const campaignId = editable?.campaignId ?? "";
    const activeOptionIndex = Number(editable?.optionIndex ?? 0);
    const existingOptions = editable?.existingOptions ?? [];

    const switchOption = React.useCallback(
        async (optionIndex: number) => {
            if (!campaignId) return;
            if (optionIndex === activeOptionIndex) return;

            try {
                setIsSwitching(true);

                const response = await getProposalCampaignOption(
                    campaignId,
                    optionIndex,
                );

                writeLastProposalOption({
                    campaignId,
                    optionIndex,
                });

                initCampaign(response.data.data, {
                    status: "proposal",
                    optionIndex,
                });

                onAfterChange?.();
            } catch (error) {
                console.error("[ProposalOptions] Switch option error", error);
                toast.error("Failed to load proposal option");
            } finally {
                setIsSwitching(false);
            }
        },
        [campaignId, activeOptionIndex, initCampaign, onAfterChange],
    );

    const createOption = React.useCallback(async () => {
        if (!editable || editable.kind !== "proposal") return;
        if (!campaignId) return;

        const payload = buildSavePayload();

        if (!payload) {
            toast.error("Proposal data is missing");
            return;
        }

        try {
            setIsCreating(true);

            const response = await postProposalSystem(payload as any, campaignId);

            const responseData = response.data.data as any;

            const nextOptionIndex = Number(
                responseData?.selectedOption?.optionIndex ??
                getNextAvailableOptionIndex(existingOptions),
            );

            writeLastProposalOption({
                campaignId,
                optionIndex: nextOptionIndex,
            });

            initCampaign(responseData, {
                status: "proposal",
                optionIndex: nextOptionIndex,
            });

            toast.success("Proposal option created");
            onAfterChange?.();
        } catch (error) {
            console.error("[ProposalOptions] Create option error", error);
            toast.error("Failed to create proposal option");
        } finally {
            setIsCreating(false);
        }
    }, [
        editable,
        campaignId,
        buildSavePayload,
        existingOptions,
        initCampaign,
        onAfterChange,
    ]);

    const deleteOption = React.useCallback(
        async (optionIndex: number) => {
            if (!campaignId) return;

            if (existingOptions.length <= 1) {
                toast.error("You cannot delete the last option");
                return;
            }

            const nextOptionIndex = getNextOptionAfterDelete({
                deletedOption: optionIndex,
                existingOptions,
            });

            if (nextOptionIndex === null) return;

            try {
                setIsDeleting(true);

                await deleteProposalOption(campaignId, optionIndex);

                const response = await getProposalCampaignOption(
                    campaignId,
                    nextOptionIndex,
                );

                writeLastProposalOption({
                    campaignId,
                    optionIndex: nextOptionIndex,
                });

                initCampaign(response.data.data, {
                    status: "proposal",
                    optionIndex: nextOptionIndex,
                });

                toast.success("Proposal option deleted");
                onAfterChange?.();
            } catch (error) {
                console.error("[ProposalOptions] Delete option error", error);
                toast.error("Failed to delete proposal option");
            } finally {
                setIsDeleting(false);
            }
        },
        [campaignId, existingOptions, initCampaign, onAfterChange],
    );

    return {
        optionIndexes: existingOptions,
        activeOptionIndex,

        isCreating,
        isDeleting,
        isSwitching,

        createOption,
        deleteOption,
        switchOption,
    };
};