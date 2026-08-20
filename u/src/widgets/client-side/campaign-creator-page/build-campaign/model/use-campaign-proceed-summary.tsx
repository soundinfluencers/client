import { useLocation, useNavigate } from "react-router-dom";

import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";

import {
    calcBuilderTotal,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/calc-builder-total";
import {
    isCampaignSelectionPricingAvailable,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-selection";

import {
    useBuildCampaignParams,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params";
import { useProposalAccountsStore } from "@/client-side/store";
import type {
    CampaignBuilderMode,
    ProposalOptionCreateContext,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation";
import {
    buildProposalAddInfluencerUrl,
    buildProposalOptionCreateUrl,
    PROPOSAL_OPTION_CREATE_MODE,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation";

type Params = {
    mode?: CampaignBuilderMode;
    optionIndex?: number | null;
    proposalOptionCreateContext?: ProposalOptionCreateContext | null;
};

export const useCampaignProceedSummary = ({
                                               mode = "create",
                                               optionIndex = null,
                                               proposalOptionCreateContext = null,
                                           }: Params) => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        selectedCurrency,
        selectedCurrencyCode,
    } = useBuildCampaignParams();

    const selectedOfferId = useCampaignBuilderStore((s) => s.selectedOfferId);
    const selectedOfferPrice = useCampaignBuilderStore(
        (s) => s.selectedOfferPrice,
    );
    const selectedPromoCardIds = useCampaignBuilderStore(
        (s) => s.selectedPromoCardIds,
    );
    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const selectedOfferAccountIds = useCampaignBuilderStore(
        (s) => s.selectedOfferAccountIds,
    );
    const selectedBundles = useCampaignBuilderStore(
        (s) => s.selectedBundles,
    );

    const setTotalPrice = useCampaignBuilderStore(
        (s) => s.actions.setTotalPrice,
    );

    const setSelectedCurrency = useCampaignBuilderStore(
        (s) => s.actions.setSelectedCurrency,
    );

    const isAddInfluencerMode = mode === "add-influencer" && optionIndex !== null;
    const isProposalOptionCreateMode = mode === PROPOSAL_OPTION_CREATE_MODE;

    const proposalSnapshot = useProposalAccountsStore((state) =>
        isAddInfluencerMode
            ? state.optionSnapshotsByIndex[optionIndex]
            : undefined,
    );

    const totalPrice = calcBuilderTotal({
        selectedOfferId,
        selectedOfferPrice,
        selectedAccounts,
        selectedBundles,
        selectedOfferAccountIds,
        currency: selectedCurrencyCode,
    });
    const displayCurrencySymbol = selectedCurrency?.key ?? "EUR";

    const hasSelection = Boolean(
            selectedOfferId ||
            selectedPromoCardIds.length >= 1 ||
            selectedBundles.length >= 1,
        );
    const hasAvailablePricing =
        isCampaignSelectionPricingAvailable({
            selectedOfferId,
            selectedOfferPrice,
            selectedAccounts,
            selectedBundles,
            selectedOfferAccountIds,
            currency: selectedCurrencyCode,
        });
    const canProceed =
        hasSelection &&
        hasAvailablePricing &&
        (!isAddInfluencerMode || Boolean(proposalSnapshot)) &&
        (!isProposalOptionCreateMode || Boolean(proposalOptionCreateContext));

    const handleProceed = () => {
        if (!canProceed) return;

        const currencySymbol = selectedCurrency?.key ?? "€";

        setTotalPrice(totalPrice);
        setSelectedCurrency(currencySymbol);

        if (isAddInfluencerMode) {
            const currentSearchParams = new URLSearchParams(location.search);

            navigate(
                buildProposalAddInfluencerUrl({
                    optionIndex,
                    currency: selectedCurrencyCode,
                    pathname: "/client/create-campaign/content",
                    platform: currentSearchParams.get("platform") ?? undefined,
                    genre: currentSearchParams.get("genre") ?? undefined,
                }),
            );
            return;
        }

        if (isProposalOptionCreateMode && proposalOptionCreateContext) {
            navigate(
                buildProposalOptionCreateUrl(
                    "/client/create-campaign/content",
                    proposalOptionCreateContext,
                ),
            );
            return;
        }

        navigate("/client/create-campaign/content");
    };

    return {
        isAddInfluencerMode,
        isProposalOptionCreateMode,
        selectedCurrency,
        selectedOfferId,
        selectedPromoCardIds,
        selectedBundles,
        selectedAccounts,
        totalPrice,
        displayCurrencySymbol,
        canProceed,
        handleProceed,
    };
};
