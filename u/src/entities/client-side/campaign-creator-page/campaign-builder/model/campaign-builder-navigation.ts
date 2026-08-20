import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";
import { isCampaignDisplayCurrency } from "@/shared/functions/formatCurrency";
import type {
    CampaignCurrencySwitchResult,
} from "./campaign-builder.types";

export const PROPOSAL_OPTION_CREATE_MODE = "proposal-option-create" as const;

export type CampaignBuilderMode =
    | "create"
    | "add-influencer"
    | typeof PROPOSAL_OPTION_CREATE_MODE;

export type ProposalOptionCreateContext = {
    mode: typeof PROPOSAL_OPTION_CREATE_MODE;
    campaignId: string;
    returnTo: string;
    currency: CampaignCurrencyCode;
};

export const isProposalOptionCreateRequested = (
    searchParams: URLSearchParams,
): boolean => searchParams.get("mode") === PROPOSAL_OPTION_CREATE_MODE;

export const parseProposalOptionCreateContext = (
    searchParams: URLSearchParams,
): ProposalOptionCreateContext | null => {
    if (!isProposalOptionCreateRequested(searchParams)) return null;

    const campaignId = searchParams.get("campaignId")?.trim() ?? "";
    const currency = searchParams.get("currency");
    const returnTo = searchParams.get("returnTo") ?? "/client/campaign";

    if (
        !campaignId ||
        !isCampaignDisplayCurrency(currency) ||
        !returnTo.startsWith("/")
    ) {
        return null;
    }

    return {
        mode: PROPOSAL_OPTION_CREATE_MODE,
        campaignId,
        returnTo,
        currency,
    };
};

export const buildProposalOptionCreateUrl = (
    pathname: "/client/create-campaign" | "/client/create-campaign/content",
    context: ProposalOptionCreateContext,
): string => {
    const searchParams = new URLSearchParams({
        mode: PROPOSAL_OPTION_CREATE_MODE,
        campaignId: context.campaignId,
        returnTo: context.returnTo,
        currency: context.currency,
    });

    return `${pathname}?${searchParams.toString()}`;
};

export const buildProposalAddInfluencerUrl = ({
    optionIndex,
    currency,
    pathname = "/client/create-campaign",
    platform,
    genre,
}: {
    optionIndex: number;
    currency: CampaignCurrencyCode;
    pathname?: string;
    platform?: string;
    genre?: string;
}): string => {
    const searchParams = new URLSearchParams({
        mode: "add-influencer",
        option: String(optionIndex),
        currency,
    });
    if (platform) searchParams.set("platform", platform.toLowerCase());
    if (genre) searchParams.set("genre", genre);

    return `${pathname}?${searchParams.toString()}`;
};

export const initializeProposalAddInfluencerCurrency = ({
    currency,
    reset,
    switchCurrency,
}: {
    currency: unknown;
    reset: () => void;
    switchCurrency: (
        currency: CampaignCurrencyCode,
    ) => CampaignCurrencySwitchResult;
}): boolean => {
    if (!isCampaignDisplayCurrency(currency)) return false;

    reset();

    const result = switchCurrency(currency);

    if (!result.ok) {
        reset();
        return false;
    }

    return true;
};
