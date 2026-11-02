import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import { useCreateProposalOption } from "@/client-side/pages/campaign/model/use-create-proposal-option";
import { buildBuilderProposalOption, optionCreateContext } from "@/client-side/utils/proposal-option-create";
import { reconcileDraftWorkflow } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/draft-occurrences";
import { serializeCampaignContent } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-content.transport";
import { useFetchCampaign, useProposalAccountsStore, useUpdateCampaign } from "@/client-side/store";

export const useCreateOptionFromBuilder = (params: URLSearchParams) => {
    const navigate = useNavigate();
    let context: ReturnType<typeof optionCreateContext> = null, invalid = false;
    try { context = optionCreateContext(params); } catch { invalid = true; }
    const submission = useCreateProposalOption(context?.campaignId ?? "", `${context?.campaignId}:${context?.sourceOption}`);
    const [busy, setBusy] = React.useState(false);
    const [finalizing, setFinalizing] = React.useState(false);
    const lock = React.useRef(false), mounted = React.useRef(false);
    React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const finish = (fresh: any) => {
        if (!fresh || !mounted.current) return;
        sessionStorage.setItem("lastCampaign", JSON.stringify({ id: fresh.campaignId, status: "proposal", optionIndex: fresh.selectedOption.optionIndex }));
        setFinalizing(true);
        useCampaignBuilderStore.getState().actions.reset();
        toast.success("Proposal option added successfully!");
        navigate("/client/campaign", { replace: true });
    };
    const submit = async (payload?: any) => {
        if (!context || lock.current || submission.isBlocked) return;
        lock.current = true; setBusy(true);
        try {
            if (submission.hasIdentity()) { finish(await submission.retry()); return; }
            const state = useCampaignBuilderStore.getState();
            const next = { ...state, campaignName: payload.campaignName ?? state.campaignName, selectedAccounts: reconcileDraftWorkflow(state.selectedAccounts, payload.addedAccounts), campaignContent: payload.campaignContent };
            const body = buildBuilderProposalOption(next);
            const editorKey = useFetchCampaign.getState().requestKey;
            const detachEditor = () => {
                const patches = useUpdateCampaign.getState().patches;
                if (!Object.keys(patches).length) return;
                const match = /^proposal:([^:]+):(\d+)$/.exec(editorKey ?? "");
                const cache = useProposalAccountsStore.getState();
                if (!match || match[1] !== context.campaignId || cache.currentCampaignId !== context.campaignId || useFetchCampaign.getState().requestKey !== editorKey) throw new Error("Reopen the source editor to review its unsaved content before creating an option.");
                const index = Number(match[2]), content = cache.contentByOption[index] ?? [];
                if (Object.keys(patches).some((id) => !content.some((item) => item._id === id))) throw new Error("Review unmatched editor content before creating an option.");
                useProposalAccountsStore.setState({ contentByOption: { ...cache.contentByOption,
                    [index]: serializeCampaignContent(content.map((item) => ({ ...item, ...(patches[item._id] ?? {}) }))) } });
                useUpdateCampaign.getState().reset();
            };
            // Direct URLs also detach only the reader-owned editor, never by matching content IDs.
            detachEditor();
            // Keep entered form state on a refused POST or interrupted GET.
            state.actions.setCampaignName(next.campaignName);
            state.actions.setCampaignContent(payload.campaignContent);
            state.actions.syncSelectedAccountsContent(payload.addedAccounts);
            finish(await submission.submit(body, context.sourceOption, detachEditor));
        } catch (error) { if (mounted.current) toast.error(error instanceof Error ? error.message : "Failed to create option"); }
        finally { lock.current = false; if (mounted.current) setBusy(false); }
    };
    return { submit, busy, finalizing, needsRead: submission.needsRead, blocked: submission.isBlocked, invalid, enabled: Boolean(context) };
};
