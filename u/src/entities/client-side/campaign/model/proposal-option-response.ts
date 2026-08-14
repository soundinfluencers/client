import type {
    CreateProposalOptionResult,
    ProposalCampaignDto,
} from "./campaign-api.types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

export class CreateProposalOptionResponseValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CreateProposalOptionResponseValidationError";
    }
}

export const parseCreateProposalOptionResponse = (
    response: unknown,
): CreateProposalOptionResult => {
    if (
        !isRecord(response) ||
        !Number.isInteger(response.statusCode) ||
        typeof response.message !== "string" ||
        !isRecord(response.data)
    ) {
        throw new CreateProposalOptionResponseValidationError(
            "Invalid create Proposal option response envelope",
        );
    }

    const { campaignId, optionIndex } = response.data;

    if (
        typeof campaignId !== "string" ||
        !campaignId.trim() ||
        typeof optionIndex !== "number" ||
        !Number.isInteger(optionIndex) ||
        optionIndex < 0
    ) {
        throw new CreateProposalOptionResponseValidationError(
            "Invalid create Proposal option identity",
        );
    }

    return {
        campaignId,
        optionIndex,
    };
};

export const isCreatedProposalOptionForCampaign = (
    result: CreateProposalOptionResult,
    campaignId: string,
): boolean =>
    result.campaignId === campaignId &&
    Number.isInteger(result.optionIndex) &&
    result.optionIndex >= 0;

export const isAuthoritativeCreatedProposalOption = (
    data: ProposalCampaignDto,
    created: CreateProposalOptionResult,
): boolean =>
    data?.campaignId === created.campaignId &&
    data?.selectedOption?.optionIndex === created.optionIndex &&
    Array.isArray(data?.existingOptions) &&
    data.existingOptions.includes(created.optionIndex);
