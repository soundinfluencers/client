import React from "react";
import { useSearchParams } from "react-router-dom";

import type { CampaignKind } from "@/entities/client-side/campaign/store/campaign.store";
import type { CampaignTableMode, CampaignView } from "./campaign-view.types";
import {
    CAMPAIGN_ADVANCED_INSIGHTS_PARAM,
    CAMPAIGN_TABLE_MODE_PARAM,
    CAMPAIGN_VIEW_PARAM,
    normalizeAdvancedInsights,
    normalizeCampaignView,
    normalizeTableMode,
} from "./campaign-view.helpers";

type Params = {
    kind?: CampaignKind | null;
    canEdit?: boolean;
};

export const useCampaignViewParams = ({ kind, canEdit }: Params) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const mode = React.useMemo(() => {
        return normalizeTableMode({
            value: searchParams.get(CAMPAIGN_TABLE_MODE_PARAM),
            kind,
        });
    }, [searchParams, kind]);

    const view = React.useMemo(() => {
        return normalizeCampaignView({
            value: searchParams.get(CAMPAIGN_VIEW_PARAM),
            kind,
            canEdit,
        });
    }, [searchParams, kind, canEdit]);

    const isAdvancedInsights = React.useMemo(() => {
        return normalizeAdvancedInsights(
            searchParams.get(CAMPAIGN_ADVANCED_INSIGHTS_PARAM),
        );
    }, [searchParams]);

    const patchParams = React.useCallback(
        (
            patch: Partial<
                Record<"mode" | "view" | "advanced", string | number | boolean>
            >,
        ) => {
            const nextParams = new URLSearchParams(searchParams);

            if (patch.mode !== undefined) {
                nextParams.set(CAMPAIGN_TABLE_MODE_PARAM, String(patch.mode));
            }

            if (patch.view !== undefined) {
                nextParams.set(CAMPAIGN_VIEW_PARAM, String(patch.view));
            }

            if (patch.advanced !== undefined) {
                if (patch.advanced) {
                    nextParams.set(CAMPAIGN_ADVANCED_INSIGHTS_PARAM, "1");
                } else {
                    nextParams.delete(CAMPAIGN_ADVANCED_INSIGHTS_PARAM);
                }
            }

            setSearchParams(nextParams, { replace: true });
        },
        [searchParams, setSearchParams],
    );

    const setMode = React.useCallback(
        (nextMode: CampaignTableMode) => {
            const normalized = normalizeTableMode({
                value: nextMode,
                kind,
            });

            patchParams({ mode: normalized });
        },
        [kind, patchParams],
    );

    const toggleMode = React.useCallback(() => {
        setMode(mode === "strategy" ? "insight" : "strategy");
    }, [mode, setMode]);

    const setView = React.useCallback(
        (nextView: CampaignView) => {
            const normalized = normalizeCampaignView({
                value: nextView,
                kind,
                canEdit,
            });

            patchParams({ view: normalized });
        },
        [kind, canEdit, patchParams],
    );

    const setAdvancedInsights = React.useCallback(
        (nextValue: boolean) => {
            patchParams({ advanced: nextValue });
        },
        [patchParams],
    );

    const toggleAdvancedInsights = React.useCallback(() => {
        setAdvancedInsights(!isAdvancedInsights);
    }, [isAdvancedInsights, setAdvancedInsights]);

    React.useEffect(() => {
        const normalizedMode = normalizeTableMode({
            value: searchParams.get(CAMPAIGN_TABLE_MODE_PARAM),
            kind,
        });

        const normalizedView = normalizeCampaignView({
            value: searchParams.get(CAMPAIGN_VIEW_PARAM),
            kind,
            canEdit,
        });

        const normalizedAdvanced = normalizeAdvancedInsights(
            searchParams.get(CAMPAIGN_ADVANCED_INSIGHTS_PARAM),
        );

        const currentMode = searchParams.get(CAMPAIGN_TABLE_MODE_PARAM);
        const currentView = searchParams.get(CAMPAIGN_VIEW_PARAM);
        const currentAdvanced = normalizeAdvancedInsights(
            searchParams.get(CAMPAIGN_ADVANCED_INSIGHTS_PARAM),
        );

        if (
            currentMode === normalizedMode &&
            currentView === String(normalizedView) &&
            currentAdvanced === normalizedAdvanced
        ) {
            return;
        }

        const nextParams = new URLSearchParams(searchParams);

        nextParams.set(CAMPAIGN_TABLE_MODE_PARAM, normalizedMode);
        nextParams.set(CAMPAIGN_VIEW_PARAM, String(normalizedView));

        if (normalizedAdvanced) {
            nextParams.set(CAMPAIGN_ADVANCED_INSIGHTS_PARAM, "1");
        } else {
            nextParams.delete(CAMPAIGN_ADVANCED_INSIGHTS_PARAM);
        }

        setSearchParams(nextParams, { replace: true });
    }, [searchParams, setSearchParams, kind, canEdit]);

    return {
        mode,
        view,
        isAdvancedInsights,

        setMode,
        setView,
        setAdvancedInsights,

        toggleMode,
        toggleAdvancedInsights,

        isStrategyMode: mode === "strategy",
        isInsightMode: mode === "insight",
        isEditView: view === -1,
        isProView: view === 0,
        isLiveView: view === 1,
    };
};