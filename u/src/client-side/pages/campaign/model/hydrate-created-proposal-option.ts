import { getProposalCampaign } from "@/api/client/campaign/campaign.api";
import {
    useFetchCampaign,
    useProposalAccountsStore,
    useUpdateCampaign,
} from "@/client-side/store";
import { toCampaignPageModelFromProposal } from "@/client-side/utils/getCampaign.utils";
import type {
    CreateProposalOptionResult,
} from "@/entities/client-side/campaign/model/campaign-api.types";
import {
    isAuthoritativeCreatedProposalOption,
} from "@/entities/client-side/campaign/model/proposal-option-response";
import type { CampaignAddedAccount } from "@/types/store/index.types";

import {
    writeLastProposalOptionSession,
} from "./campaign-page.utils";

export const hydrateCreatedProposalOption = async (
    created: CreateProposalOptionResult,
) => {
    const { data: response } = await getProposalCampaign(
        created.campaignId,
        created.optionIndex,
    );
    const authoritativeData = response.data;

    if (!isAuthoritativeCreatedProposalOption(authoritativeData, created)) {
        throw new Error(
            "Created Proposal option GET did not match POST response",
        );
    }

    const refreshed = toCampaignPageModelFromProposal(authoritativeData);
    const proposalStore = useProposalAccountsStore.getState();

    proposalStore.setOptionSnapshot(authoritativeData.selectedOption);
    proposalStore.initOption(
        created.optionIndex,
        authoritativeData.selectedOption
            .addedAccounts as unknown as CampaignAddedAccount[],
        authoritativeData.selectedOption.campaignContent,
        { force: true },
    );

    useUpdateCampaign.getState().reset();
    useFetchCampaign.setState({ data: refreshed });

    writeLastProposalOptionSession({
        campaignId: created.campaignId,
        optionIndex: created.optionIndex,
    });

    return refreshed;
};
