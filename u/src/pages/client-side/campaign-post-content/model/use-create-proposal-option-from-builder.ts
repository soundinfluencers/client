import React from "react";
import { flushSync } from "react-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import type {
    ProposalOptionCreateContext,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation";
import {
    buildProposalOptionCreateRequest,
    createProposalOptionCompletionController,
    createProposalOptionSubmitController,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-option-create.submit";
import {
    postProposalSystem,
} from "@/entities/client-side/campaign/api/proposal-system.api";
import type {
    CreateProposalOptionResult,
} from "@/entities/client-side/campaign/model/campaign-api.types";
import type {
    BuiltCampaignPostContentPayload,
} from "@/widgets/client-side/campaign-post-content/model/campaign-post-content.types";
import {
    hydrateCreatedProposalOption,
} from "@/client-side/pages/campaign/model/hydrate-created-proposal-option";

export const useCreateProposalOptionFromBuilder = (
    context: ProposalOptionCreateContext | null,
) => {
    const navigate = useNavigate();
    const mountedRef = React.useRef(true);
    const [submitController] = React.useState(
        () => createProposalOptionSubmitController(postProposalSystem),
    );
    const [completionController] = React.useState(
        () => createProposalOptionCompletionController({
            submitController,
            hydrateCreatedOption: async (created) => {
                await hydrateCreatedProposalOption(created);
            },
        }),
    );
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isLoadingOption, setIsLoadingOption] = React.useState(false);
    const [isFinalizing, setIsFinalizing] = React.useState(false);
    const [isTerminalFailure, setIsTerminalFailure] = React.useState(false);
    const [createdIdentity, setCreatedIdentity] =
        React.useState<CreateProposalOptionResult | null>(null);

    React.useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    const submit = React.useCallback(
        async (contentPayload: BuiltCampaignPostContentPayload) => {
            if (!context || completionController.isInFlight()) return;

            const existingIdentity = submitController.getCreatedIdentity();
            if (!existingIdentity && submitController.isLocked()) return;

            setIsSubmitting(true);
            setIsLoadingOption(existingIdentity !== null);
            setIsTerminalFailure(false);

            try {
                await completionController.complete(
                    async () => {
                        const builder = useCampaignBuilderStore.getState();

                        builder.actions.setCampaignName(
                            contentPayload.campaignName,
                        );
                        builder.actions.setCampaignContent(
                            contentPayload.campaignContent,
                        );
                        builder.actions.syncSelectedAccountsContent(
                            contentPayload.addedAccounts,
                        );

                        // Zustand actions above are synchronous. Read the
                        // updated snapshot so serialization cannot see stale refs.
                        const synchronizedBuilder =
                            useCampaignBuilderStore.getState();
                        const request = buildProposalOptionCreateRequest({
                            context,
                            builder: synchronizedBuilder,
                        });
                        const created = await submitController.submit(
                            request,
                            context.campaignId,
                        );

                        if (mountedRef.current) {
                            setCreatedIdentity(created);
                            setIsLoadingOption(true);
                        }

                        return created;
                    },
                    () => {
                        if (!mountedRef.current) return;

                        // Commit the terminal presentation before the Builder
                        // reset can expose its empty state to the mounted page.
                        flushSync(() => {
                            setIsFinalizing(true);
                        });
                        useCampaignBuilderStore.getState().actions.reset();
                        toast.success("Proposal option added successfully!");
                        navigate(context.returnTo, { replace: true });
                    },
                );
            } catch (error) {
                const retainedIdentity =
                    submitController.getCreatedIdentity();
                const terminalFailure =
                    retainedIdentity === null && submitController.isLocked();

                if (mountedRef.current) {
                    setCreatedIdentity(retainedIdentity);
                    setIsTerminalFailure(terminalFailure);

                    const message = retainedIdentity
                        ? "Option was created, but it could not be loaded. Retry to load the same option."
                        : terminalFailure
                            ? "Option may have been created, but its identity could not be confirmed. Do not submit again."
                            : error instanceof Error
                                ? error.message
                                : "Failed to create Proposal option";

                    toast.error(message);
                }
            } finally {
                if (mountedRef.current) {
                    setIsSubmitting(false);
                    setIsLoadingOption(false);
                }
            }
        },
        [completionController, context, navigate, submitController],
    );

    return {
        submit,
        isSubmitting,
        isLoadingOption,
        isFinalizing,
        createdIdentity,
        isSubmitLocked: isSubmitting || isFinalizing || isTerminalFailure,
    };
};
