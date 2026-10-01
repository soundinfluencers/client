import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    useDraftCampaignStore,
    useFetchCampaign,
    useProposalAccountsStore,
    useStrategyCampaignStore,
} from "@/client-side/store";
import { parseLastCampaignSession } from "./campaign-page.utils";

export const useCampaignPageBootstrap = (campaignData: any) => {
    const navigate = useNavigate();
    const location = useLocation();
    const session = React.useMemo(parseLastCampaignSession, [location.key]);
    const sessionId = session?.id;
    const sessionKind = session?.status === "draft" || session?.status === "proposal"
        ? session.status
        : "regular";
    const sessionOption = sessionKind === "proposal" ? session?.optionIndex ?? 0 : 0;
    const data = campaignData?.kind === sessionKind &&
        String(sessionKind === "draft" ? campaignData.draftId : campaignData.campaignId) === sessionId
        ? campaignData
        : null;

    const initOption = useProposalAccountsStore((s) => s.initOption);
    const initCampaign = useStrategyCampaignStore((s) => s.initCampaign);
    const initDraft = useDraftCampaignStore((s) => s.initCampaign);

    const currentProposalCampaignId = useProposalAccountsStore(
        (s) => s.currentCampaignId,
    );
    const setCurrentProposalCampaignId = useProposalAccountsStore(
        (s) => s.setCurrentCampaignId,
    );
    const clearProposalStore = useProposalAccountsStore((s) => s.clearAll);

    React.useEffect(() => {
        if (!sessionId) {
            navigate("/client/dashboard");
            return;
        }

        // Revalidate on entry; server data changes must not trigger another GET.
        if (sessionKind === "draft") {
            useFetchCampaign.getState().setDraft(sessionId);
        } else if (sessionKind === "proposal") {
            useFetchCampaign.getState().setProposalOption(sessionId, sessionOption);
        } else {
            useFetchCampaign.getState().setCampaign(sessionId);
        }
    }, [location.key, sessionId, sessionKind, sessionOption, navigate]);

    React.useEffect(() => {
        if (data?.kind !== "proposal") return;

        const nextCampaignId = String(data.campaignId ?? "");
        if (!nextCampaignId) return;

        if (
            currentProposalCampaignId &&
            currentProposalCampaignId !== nextCampaignId
        ) {
            clearProposalStore();
        }

        if (currentProposalCampaignId !== nextCampaignId) {
            setCurrentProposalCampaignId(nextCampaignId);
        }
    }, [
        data?.kind,
        data?.campaignId,
        currentProposalCampaignId,
        clearProposalStore,
        setCurrentProposalCampaignId,
    ]);

    React.useEffect(() => {
        if (data?.kind !== "proposal") return;

        const idx = data.selectedOption?.optionIndex ?? 0;
        const state = useProposalAccountsStore.getState();

        const hasLocalAccounts = (state.accountsByOption?.[idx] ?? []).length > 0;
        const hasLocalContent = (state.contentByOption?.[idx] ?? []).length > 0;

        if (hasLocalAccounts || hasLocalContent) return;

        initOption(
            idx,
            data.selectedOption?.addedAccounts ?? [],
            data.selectedOption?.campaignContent ?? [],
        );
    }, [data, initOption]);

    React.useEffect(() => {
        if (data?.kind === "regular") {
            initCampaign(
                data.campaignId,
                data.addedAccounts ?? [],
                data.campaignContent ?? [],
            );
        }
    }, [data, initCampaign]);

    React.useEffect(() => {
        if (data?.kind === "draft") {
            initDraft(
                data.draftId,
                data.addedAccounts ?? [],
                data.campaignContent ?? [],
            );
        }
    }, [data, initDraft]);
};
