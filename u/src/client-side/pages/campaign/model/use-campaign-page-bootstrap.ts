import React from "react";
import { useNavigate } from "react-router-dom";
import {
    useDraftCampaignStore,
    useFetchCampaign,
    useProposalAccountsStore,
    useStrategyCampaignStore,
} from "@/client-side/store";
import {
    getCurrentDataId,
    parseLastCampaignSession,
} from "./campaign-page.utils";

export const useCampaignPageBootstrap = (data: any) => {
    const navigate = useNavigate();

    const initOption = useProposalAccountsStore((s) => s.initOption);
    const initCampaign = useStrategyCampaignStore((s) => s.initCampaign);
    const initDraft = useDraftCampaignStore((s) => s.initCampaign);

    React.useEffect(() => {
        const session = parseLastCampaignSession();

        if (!session) {
            navigate("/client/dashboard");
            return;
        }

        const currentId = getCurrentDataId(data);

        if (!data || currentId !== session.id) {
            if (session.status === "draft" || session.status === "pending")  {
                useFetchCampaign.getState().setDraft(session.id);
                return;
            }

            if (session.status === "proposal") {
                useFetchCampaign
                    .getState()
                    .setProposalOption(session.id, session.optionIndex ?? 0);
                return;
            }

            useFetchCampaign.getState().setCampaign(session.id);
        }
    }, [data, navigate]);

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