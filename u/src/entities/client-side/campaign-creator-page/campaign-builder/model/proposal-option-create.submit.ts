import type {
    CampaignBuilderState,
} from "./campaign-builder.types";
import {
    assertInitialProposalCreateTopology,
    buildStrategyProposalPayload,
} from "./campaign-strategy.payload.ts";
import type {
    ProposalOptionCreateContext,
} from "./campaign-builder-navigation";
import type {
    CreateProposalCampaignRequest,
    CreateProposalOptionResult,
} from "../../../campaign/model/campaign-api.types";
import {
    CreateProposalOptionResponseValidationError,
    isCreatedProposalOptionForCampaign,
} from "../../../campaign/model/proposal-option-response.ts";

type ProposalOptionCreateBuilderState = Pick<
    CampaignBuilderState,
    | "campaignName"
    | "totalPrice"
    | "selectionCurrency"
    | "selectedAccounts"
    | "campaignContent"
    | "selectedOfferId"
    | "selectedOfferAccountIds"
>;

type CreateProposalOptionCommand = (
    request: CreateProposalCampaignRequest,
    campaignId: string,
) => Promise<CreateProposalOptionResult>;

const assertProposalOptionCreateContent = (
    request: CreateProposalCampaignRequest,
) => {
    if (!request.campaignName.trim()) {
        throw new Error("Proposal campaign name is missing");
    }

    if (
        !Number.isFinite(request.campaignPrice) ||
        request.campaignPrice < 0
    ) {
        throw new Error("Proposal campaign price is invalid");
    }

    if (request.addedAccounts.length === 0) {
        throw new Error("Proposal must contain at least one account");
    }

    if (request.campaignContent.length === 0) {
        throw new Error("Proposal campaign content is missing");
    }

    const contentDescriptions = new Map(
        request.campaignContent.map((item) => [
            item._id,
            new Set(item.descriptions.map((description) => description._id)),
        ]),
    );

    request.addedAccounts.forEach((account) => {
        const selectedContent = account.selectedCampaignContentItem;

        if (
            !account.influencerId.trim() ||
            !account.socialMedia.trim() ||
            !account.username.trim() ||
            !account.dateRequest.trim() ||
            !selectedContent?.campaignContentItemId.trim() ||
            !selectedContent.descriptionId.trim()
        ) {
            throw new Error("Proposal account content or date is incomplete");
        }

        const descriptionIds = contentDescriptions.get(
            selectedContent.campaignContentItemId,
        );

        if (!descriptionIds?.has(selectedContent.descriptionId)) {
            throw new Error("Proposal account content selection is invalid");
        }
    });
};

export const buildProposalOptionCreateRequest = ({
    context,
    builder,
}: {
    context: ProposalOptionCreateContext;
    builder: ProposalOptionCreateBuilderState;
}): CreateProposalCampaignRequest => {
    if (!context.campaignId.trim()) {
        throw new Error("Proposal campaign context is missing");
    }

    if (
        !builder.selectionCurrency ||
        !(["EUR", "USD", "GBP"] as const).includes(
            builder.selectionCurrency,
        )
    ) {
        throw new Error("Proposal Builder currency is invalid");
    }

    const request = buildStrategyProposalPayload({
        campaignName: builder.campaignName,
        totalPrice: builder.totalPrice,
        displayCurrency: builder.selectionCurrency,
        accounts: builder.selectedAccounts,
        content: builder.campaignContent,
        selectedOfferId: builder.selectedOfferId,
        selectedOfferAccountIds: builder.selectedOfferAccountIds,
    });

    assertInitialProposalCreateTopology(request);
    assertProposalOptionCreateContent(request);

    return request;
};

export type ProposalOptionCreateSubmitController = ReturnType<
    typeof createProposalOptionSubmitController
>;

export const createProposalOptionSubmitController = (
    createOption: CreateProposalOptionCommand,
) => {
    let inFlight: Promise<CreateProposalOptionResult> | null = null;
    let createdIdentity: CreateProposalOptionResult | null = null;
    let creationMayHaveSucceeded = false;

    const submit = (
        request: CreateProposalCampaignRequest,
        campaignId: string,
    ): Promise<CreateProposalOptionResult> => {
        if (createdIdentity) return Promise.resolve(createdIdentity);
        if (inFlight) return inFlight;

        if (creationMayHaveSucceeded) {
            return Promise.reject(
                new Error(
                    "Proposal option may already exist and cannot be submitted again",
                ),
            );
        }

        inFlight = (async () => {
            try {
                const created = await createOption(request, campaignId);
                creationMayHaveSucceeded = true;

                if (!isCreatedProposalOptionForCampaign(created, campaignId)) {
                    throw new Error(
                        "Created Proposal option does not match its campaign",
                    );
                }

                createdIdentity = created;
                return created;
            } catch (error) {
                if (
                    error instanceof CreateProposalOptionResponseValidationError
                ) {
                    creationMayHaveSucceeded = true;
                }

                throw error;
            } finally {
                inFlight = null;
            }
        })();

        return inFlight;
    };

    return {
        submit,
        getCreatedIdentity: () => createdIdentity,
        isSubmitting: () => inFlight !== null,
        isLocked: () =>
            createdIdentity !== null || creationMayHaveSucceeded,
    };
};

type HydrateCreatedProposalOptionCommand = (
    created: CreateProposalOptionResult,
) => Promise<void>;

type FinalizeCreatedProposalOptionCommand = (
    created: CreateProposalOptionResult,
) => void | Promise<void>;

export const createProposalOptionCompletionController = ({
    submitController,
    hydrateCreatedOption,
}: {
    submitController: ProposalOptionCreateSubmitController;
    hydrateCreatedOption: HydrateCreatedProposalOptionCommand;
}) => {
    let inFlight: Promise<CreateProposalOptionResult> | null = null;
    let completedIdentity: CreateProposalOptionResult | null = null;

    const complete = (
        createIdentity: () => Promise<CreateProposalOptionResult>,
        finalize: FinalizeCreatedProposalOptionCommand,
    ): Promise<CreateProposalOptionResult> => {
        if (completedIdentity) return Promise.resolve(completedIdentity);
        if (inFlight) return inFlight;

        const operation = (async () => {
            const created =
                submitController.getCreatedIdentity() ??
                await createIdentity();

            await hydrateCreatedOption(created);
            await finalize(created);

            completedIdentity = created;
            return created;
        })();

        inFlight = operation.finally(() => {
            inFlight = null;
        });

        return inFlight;
    };

    return {
        complete,
        getCreatedIdentity: () => submitController.getCreatedIdentity(),
        getCompletedIdentity: () => completedIdentity,
        isInFlight: () => inFlight !== null,
    };
};
