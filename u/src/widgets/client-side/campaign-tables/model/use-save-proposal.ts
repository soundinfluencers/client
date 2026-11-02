import React from "react";
import { toast } from "react-toastify";
import { buildStrategyProposalPayload } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload";
import {postCampaignProposal, getSavedProposal} from "@/entities/client-side/campaign-strategy-page/api/save-proposal.ts";
import { getBuilderSelectedOffer } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";

export const useSaveProposal = () => {
    const [isProposalModalOpen, setProposalModalOpen] = React.useState(false);
    const [campaignProposalId, setCampaignProposalId] = React.useState("");
    const [createdProposal, setCreatedProposal] = React.useState<any>(null);
    const [socialType, setSocialType] = React.useState("");
    const [isSavingProposal, setIsSavingProposal] = React.useState(false);
    const [proposalReadPending, setProposalReadPending] = React.useState(false);
    const created = React.useRef<{ campaignId: string; optionIndex: number } | null>(null);
    const busy = React.useRef(false);
    const postSucceeded = React.useRef(false);
    const session = React.useRef(0);
    React.useEffect(() => () => { session.current++; }, []);

    const saveProposal = React.useCallback(async () => {
        if (busy.current) return;
        busy.current = true;
        const owner = session.current;
        const current = () => owner === session.current;
        setIsSavingProposal(true);
        setProposalModalOpen(false);
        try {
            if (!created.current) {
            if (postSucceeded.current) throw new Error("Proposal was created but its identity could not be read. Reopen it from the dashboard; do not create it again.");
            const state = useCampaignBuilderStore.getState();
            if (!state.totalPriceReady) {
                throw new Error("Prices are unavailable for the selected currency. Review the selection before saving the proposal.");
            }
            const proposalPayload = buildStrategyProposalPayload({
                campaignName: state.campaignName,
                totalPrice: state.totalPrice,
                accounts: state.selectedAccounts,
                content: state.campaignContent,
                displayCurrency: state.selectedCurrency,
                selectedOffer: getBuilderSelectedOffer(state),
            });
            const response = await postCampaignProposal(proposalPayload);
            postSucceeded.current = true;

            const payload =
                (response as any)?.data?.data ??
                (response as any)?.data ??
                response;

            const proposalId = String(payload?.campaignId ?? "");
            const socialMedia = String(payload?.socialMedia ?? "");

            if (!proposalId || !Number.isInteger(payload?.optionIndex) || payload.optionIndex < 0) {
                throw new Error("Proposal id was not returned");
            }
            created.current = { campaignId: proposalId, optionIndex: payload.optionIndex };
            if (!current()) return;
            setCampaignProposalId(proposalId);
            setSocialType(socialMedia);
            }
            const identity = created.current!;
            if (identity.optionIndex !== 0) throw new Error("Initial Proposal returned an unexpected option index. Reopen it from the dashboard.");
            const response = await getSavedProposal(identity.campaignId, identity.optionIndex);
            if (!current()) return;
            const authoritative = (response as any)?.data?.data ?? (response as any)?.data;
            if (authoritative?.campaignId !== identity.campaignId || authoritative?.selectedOption?.optionIndex !== identity.optionIndex ||
                !authoritative?.existingOptions?.includes(identity.optionIndex)) throw new Error("Created Proposal could not be synchronized. Retry reading it.");
            setSocialType(authoritative.socialMedia ?? "");
            setCreatedProposal(authoritative);
            setProposalReadPending(false);
            setProposalModalOpen(true);

            toast.success("Proposal saved successfully");
        } catch (error) {
            if (!current()) return;
            setProposalReadPending(Boolean(created.current));
            const message =
                error instanceof Error ? error.message : "Failed to save proposal";

            toast.error(message);
        } finally {
            busy.current = false;
            if (current()) setIsSavingProposal(false);
        }
    }, []);

    return {
        isProposalModalOpen,
        campaignProposalId,
        socialType,
        setProposalModalOpen,
        saveProposal,
        createdProposal,
        isSavingProposal,
        proposalReadPending,
    };
};
