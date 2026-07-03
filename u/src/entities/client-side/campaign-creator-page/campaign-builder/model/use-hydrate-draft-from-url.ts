import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCampaignDraft } from "@/entities/client-side/campaign-draft/api/campaign-draft.api.ts";
import { hydrateCampaignBuilderFromDraft } from "./hydrate-campaign-builder-from-draft";
import { useCampaignBuilderStore } from "./campaign-builder.store";

const draftStepRouteMap = {
    addAccounts: "/client/create-campaign",
    addContent: "/client/create-campaign/content",
    strategyTable: "/client/create-campaign/content/strategy",
} as const;

// Deep-link support: a campaign step page opened with ?draftId=... (e.g. from the AI chat's
// link chips) hydrates the builder store itself instead of relying on a prior dashboard click,
// then re-navigates to the step the draft is actually on (which also drops the query param).
export const useHydrateDraftFromUrl = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const draftId = searchParams.get("draftId");
    const storeDraftId = useCampaignBuilderStore((s) => s.draftId);

    useEffect(() => {
        if (!draftId) return;

        // Already working on this draft — just clean the param off the URL.
        if (draftId === storeDraftId) {
            navigate(window.location.pathname, { replace: true });
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const draft = await getCampaignDraft(draftId);
                if (cancelled) return;

                hydrateCampaignBuilderFromDraft(draft);
                navigate(draftStepRouteMap[draft.step] ?? "/client", { replace: true });
            } catch {
                // Not found / not this client's draft — fall back to the dashboard.
                if (!cancelled) navigate("/client", { replace: true });
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftId]);
};
