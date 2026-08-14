import React from "react";
import { toast } from "react-toastify";
import { postCampaignProposal } from "@/api/client/campaign/campaign.api";
import { useCampaignStore } from "@/client-side/store";

export const useSaveProposal = () => {
    const actions = useCampaignStore((state) => state.actions);

    const [isProposalModalOpen, setProposalModalOpen] = React.useState(false);
    const [campaignProposalId, setCampaignProposalId] = React.useState("");
    const [socialType, setSocialType] = React.useState("");

    const saveProposal = React.useCallback(async () => {
        const proposalsPayload = actions.getProposalPayload();
        const created = await postCampaignProposal(proposalsPayload);
        console.log(created,'proposal-payload-id');
        const proposalId = created.campaignId ?? "";
        const socialMedia = String(
            (
                proposalsPayload as unknown as { socialMedia?: unknown }
            )?.socialMedia ?? "",
        );

        if (
            !proposalId ||
            !Number.isInteger(created.optionIndex) ||
            created.optionIndex < 0
        ) {
            throw new Error("Valid Proposal identity was not returned");
        }

        setCampaignProposalId(proposalId);
        setSocialType(socialMedia);
        setProposalModalOpen(true);

        toast.success("Proposal saved successfully!");
    }, [actions]);

    return {
        isProposalModalOpen,
        campaignProposalId,
        socialType,
        setProposalModalOpen,
        saveProposal,
    };
};
