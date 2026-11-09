import React from "react";
import { postAddProposalOption, getProposalCampaign } from "@/api/client/campaign/campaign.api";
import { useFetchCampaign, useProposalAccountsStore } from "@/client-side/store";
import { toast } from "react-toastify";

type Pending = { campaignId: string; optionIndex: number };
// One mounted submission owns POST identity and GET recovery. Never publishes fetch.data directly.
export const useCreateProposalOption = (campaignId: string, scope = campaignId) => {
    const mounted = React.useRef(false), busy = React.useRef(false);
    const pending = React.useRef<Pending | null>(null), blocked = React.useRef(false);
    const completed = React.useRef(false), intentCampaign = React.useRef(campaignId), intentScope = React.useRef(scope), currentScope = React.useRef(scope);
    currentScope.current = scope;
    const origin = React.useRef<string | null>(null), campaign = React.useRef(campaignId);
    const readPreparation = React.useRef<(() => void) | undefined>(undefined);
    const [phase, setPhase] = React.useState<"idle" | "pending" | "read" | "blocked">("idle");
    campaign.current = campaignId;
    React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const owns = (id: string) => {
        const key = useFetchCampaign.getState().requestKey;
        return mounted.current && campaign.current === id && intentScope.current === currentScope.current && (key === origin.current || (pending.current?.campaignId === id && key === `proposal:${id}:${pending.current.optionIndex}`));
    };
    const readCreated = async () => {
        const created = pending.current;
        if (!created || !owns(created.campaignId)) return null;
        readPreparation.current?.();
        const fresh = await useFetchCampaign.getState().setProposalOption(created.campaignId, created.optionIndex, () => owns(created.campaignId));
        if (!owns(created.campaignId)) return null;
        if (!fresh || fresh.campaignId !== created.campaignId || fresh.selectedOption?.optionIndex !== created.optionIndex || !fresh.existingOptions?.includes(created.optionIndex)) {
            setPhase("read"); toast.error("Option created, but reading failed or was interrupted. Retry reading; do not create it again."); return null;
        }
        const store = useProposalAccountsStore.getState();
        if (store.currentCampaignId && store.currentCampaignId !== created.campaignId) return null;
        store.setCurrentCampaignId(created.campaignId);
        store.initOption(created.optionIndex, fresh.selectedOption.addedAccounts, fresh.selectedOption.campaignContent, { force: true, snapshot: fresh.selectedOption });
        completed.current = true; setPhase("idle");
        return fresh;
    };
    const submit = async (body: any, sourceOption: number, beforeRead?: () => void) => {
        if (busy.current) return null;
        if (intentCampaign.current !== campaignId || intentScope.current !== scope) { intentScope.current = scope; intentCampaign.current = campaignId; pending.current = null; blocked.current = false; completed.current = false; }
        if (completed.current) return null; // A repeat of the completed intent must not overwrite newly edited working state.
        if (blocked.current) { if (mounted.current) setPhase("blocked"); return null; }
        busy.current = true;
        try {
            if (pending.current) return await readCreated();
            origin.current = useFetchCampaign.getState().requestKey;
            readPreparation.current = beforeRead;
            const version = useFetchCampaign.getState().requestVersion;
            setPhase("pending");
            // Also covers cold builder URLs; permission comes from the server, never query flags.
            const response = await getProposalCampaign(campaignId, sourceOption);
            const parent = response.data?.data ?? response.data;
            if (!owns(campaignId) || useFetchCampaign.getState().requestVersion !== version) return null;
            if (parent?.campaignId !== campaignId || parent?.selectedOption?.optionIndex !== sourceOption || parent.selectedOption.canEdit !== true) throw new Error("This Proposal is unavailable for creating options.");
            const cacheCampaign = useProposalAccountsStore.getState().currentCampaignId;
            if (cacheCampaign && cacheCampaign !== campaignId) throw new Error("Reopen this Proposal before creating an option from a different campaign context.");
            let result;
            try { result = await postAddProposalOption(campaignId, body); }
            catch (error: any) {
                const status = error?.response?.status;
                if (!status || status >= 500 || status === 408) blocked.current = true;
                throw error;
            }
            const identity = result?.data?.data ?? result?.data;
            if (identity?.campaignId !== campaignId || !Number.isInteger(identity.optionIndex) || identity.optionIndex < 0) {
                blocked.current = true;
                if (owns(campaignId)) { setPhase("blocked"); toast.error("The option may have been created, but its identity is unavailable. Reopen the Proposal from the dashboard; do not submit again."); }
                return null;
            }
            pending.current = { campaignId, optionIndex: identity.optionIndex };
            if (!owns(campaignId)) return null;
            setPhase("read");
            if (useFetchCampaign.getState().requestVersion !== version) return null;
            return await readCreated();
        } catch (error) {
            if (owns(campaignId)) {
                setPhase(blocked.current ? "blocked" : pending.current ? "read" : "idle");
                toast.error(blocked.current ? "The create result is uncertain. Reopen the Proposal from the dashboard; do not submit again." : error instanceof Error ? error.message : "Failed to create option");
            }
            return null;
        } finally { busy.current = false; if (owns(campaignId) && !pending.current && !blocked.current) setPhase("idle"); }
    };
    const retry = () => submit(null, 0);
    const visible = intentScope.current === scope && intentCampaign.current === campaign.current && owns(campaign.current);
    return { submit, retry, begin: () => { if (busy.current || (owns(campaignId) && (blocked.current || (pending.current && !completed.current)))) return false; pending.current = null; blocked.current = false; completed.current = false; intentCampaign.current = campaignId; intentScope.current = scope; setPhase("idle"); return true; }, phase, isBusy: phase === "pending" && visible, needsRead: phase === "read" && visible,
        isBlocked: blocked.current && visible, isUnresolved: () => owns(campaignId) && (busy.current || blocked.current || Boolean(pending.current && !completed.current)),
        hasIdentity: () => !completed.current && pending.current?.campaignId === campaignId && intentScope.current === scope && owns(campaignId), identity: () => pending.current };
};
