import {
    isProposalOptionCreateRequested,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation";

type CampaignCurrencyQueryHistory = "push" | "replace";

export const getCampaignCurrencyQueryWriteOptions = ({
    search,
    history,
}: {
    search: string | URLSearchParams;
    history: CampaignCurrencyQueryHistory;
}) => ({
    history,
    ...(isProposalOptionCreateRequested(
        typeof search === "string" ? new URLSearchParams(search) : search,
    )
        ? { clearOnDefault: false as const }
        : {}),
});
