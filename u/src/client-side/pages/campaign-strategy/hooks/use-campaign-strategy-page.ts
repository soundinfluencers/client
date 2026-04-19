import React from "react";
import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "@/client-side/store";
import { useGroupPromos } from "@/client-side/hooks";
import { calcGroupPrices } from "@/client-side/utils";
import {getCampaignSelectedAccounts, groupCampaignContent} from "../model/campaign-strategy.helpers";
import { STRATEGY_PAYMENT_ROUTE } from "../model/campaign-strategy.constants";
import { useSaveStrategyDraft } from "./use-save-strategy-draft";
import { useSaveProposal } from "./use-save-proposal";
import type {ViewMode} from "@/client-side/pages/campaign-strategy/types/campaign-strategy.types.ts";

export const useCampaignStrategyPage = () => {
    const navigate = useNavigate();

    const [checked, setChecked] = React.useState(true);
    const [changeView, setChangeView] = React.useState(false);
    const [view, setView] = React.useState<ViewMode>(1);
    const store = useCampaignStore();
    const campaignContent = useCampaignStore((state) => state.campaignContent);
    const campaignName = useCampaignStore((state) => state.campaignName);
    const promoCard = useCampaignStore((state) => state.promoCard);
    const resetCampaign = useCampaignStore((state) => state.actions.resetCampaign);

    const groupedContent = React.useMemo(
        () => groupCampaignContent(campaignContent),
        [campaignContent],
    );
    const strategyAccounts = React.useMemo(
        () => getCampaignSelectedAccounts(store),
        [store.offer, store.promoCard],
    );

    const { mainPromos, musicPromos, otherPromos } = useGroupPromos(strategyAccounts);
    console.log(strategyAccounts,'strategyAccounts')
    const { groupPrices } = React.useMemo(
        () => calcGroupPrices(strategyAccounts),
        [strategyAccounts],
    );
    console.log(groupPrices,'wadadw');
    const saveDraft = useSaveStrategyDraft();

    const proposal = useSaveProposal();

    const goToPayment = React.useCallback(() => {
        navigate(STRATEGY_PAYMENT_ROUTE);
    }, [navigate]);

    return {
        navigate,
        checked,
        setChecked,
        changeView,
        setChangeView,
        view,
        setView,
        campaignName,
        groupedContent,
        mainPromos,
        musicPromos,
        otherPromos,
        groupPrices,
        saveDraft,
        goToPayment,
        resetCampaign,
        ...proposal,
    };
};