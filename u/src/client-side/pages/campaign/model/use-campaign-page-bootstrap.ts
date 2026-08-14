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
import type {
    ProposalOptionDto,
} from "@/entities/client-side/campaign/model/campaign-api.types.ts";
import type { CampaignAddedAccount } from "@/types/store/index.types.ts";

export const useCampaignPageBootstrap = (data: any) => {
    const navigate = useNavigate();

    const initOption = useProposalAccountsStore((s) => s.initOption);
    const setOptionSnapshot = useProposalAccountsStore((s) => s.setOptionSnapshot);
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
        const session = parseLastCampaignSession();

        if (!session) {
            navigate("/client/dashboard");
            return;
        }

        const currentId = getCurrentDataId(data);

        if (!data || currentId !== session.id) {
            if (session.status === "draft") {
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

        const selectedOption: ProposalOptionDto | undefined = data.selectedOption;
        if (!selectedOption) return;

        const idx = selectedOption.optionIndex;
        const state = useProposalAccountsStore.getState();

        setOptionSnapshot(selectedOption);

        const hasLocalAccounts = (state.accountsByOption?.[idx] ?? []).length > 0;
        const hasLocalContent = (state.contentByOption?.[idx] ?? []).length > 0;

        if (hasLocalAccounts || hasLocalContent) return;

        initOption(
            idx,
            selectedOption.addedAccounts as unknown as CampaignAddedAccount[],
            selectedOption.campaignContent,
        );
    }, [data, initOption, setOptionSnapshot]);

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
