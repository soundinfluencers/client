import React from "react";
import { useNavigate } from "react-router-dom";

import { useCampaignStore } from "@/entities/client-side/campaign/store/campaign.store.ts";
import {
    getCampaign,
    getProposalCampaignOption,
} from "@/entities/client-side/campaign/api";

type CampaignLoadMode = "regular" | "proposal";

type LastCampaignPayload = {
    id: string;
    status: string;
    optionIndex: number;
};

const LAST_CAMPAIGN_KEY = "lastCampaign";

const normalizeStatus = (status: unknown) => {
    return String(status ?? "").trim().toLowerCase();
};

const getCampaignLoadMode = (status: unknown): CampaignLoadMode => {
    return normalizeStatus(status) === "proposal" ? "proposal" : "regular";
};

const readLastCampaign = (): LastCampaignPayload | null => {
    try {
        const raw = sessionStorage.getItem(LAST_CAMPAIGN_KEY);

        if (!raw) return null;

        const parsed = JSON.parse(raw);

        if (!parsed?.id) return null;

        return {
            id: String(parsed.id),
            status: normalizeStatus(parsed.status),
            optionIndex: Number(parsed.optionIndex ?? 0),
        };
    } catch (error) {
        console.error("[CampaignPage] Cannot parse lastCampaign", error);
        return null;
    }
};

export const useCampaignPage = () => {
    const navigate = useNavigate();

    const initCampaign = useCampaignStore((state) => state.initCampaign);

    const editable = useCampaignStore((state) => state.editable);
    const kind = useCampaignStore((state) => state.kind);
    const activeOptionIndex = useCampaignStore((state) => state.activeOptionIndex);

    const [isLoading, setIsLoading] = React.useState(true);
    const [isError, setIsError] = React.useState(false);
    const [reloadKey, setReloadKey] = React.useState(0);

    const loadCampaign = React.useCallback(
        async (force = false) => {
            const lastCampaign = readLastCampaign();

            if (!lastCampaign?.id) {
                navigate("/client/dashboard");
                return;
            }

            const campaignId = lastCampaign.id;
            const status = normalizeStatus(lastCampaign.status);
            const optionIndex = Number(lastCampaign.optionIndex ?? 0);
            const mode = getCampaignLoadMode(status);

            const isSameRegularCampaign =
                mode === "regular" &&
                editable?.campaignId === campaignId &&
                editable?.status === status;

            const isSameProposalCampaign =
                mode === "proposal" &&
                editable?.campaignId === campaignId &&
                editable?.status === status &&
                Number(editable?.optionIndex ?? 0) === optionIndex;

            const alreadyLoaded =
                isSameRegularCampaign || isSameProposalCampaign;

            if (!force && alreadyLoaded) {
                setIsLoading(false);
                setIsError(false);
                return;
            }

            try {
                setIsLoading(true);
                setIsError(false);

                if (mode === "proposal") {
                    const response = await getProposalCampaignOption(
                        campaignId,
                        optionIndex,
                    );
                    console.log(response,'proposal-campaign');
                    initCampaign(response.data.data, {
                        status,
                        optionIndex,
                    });

                    return;
                }

                const response = await getCampaign(campaignId);

                initCampaign(response.data.data, {
                    status,
                });
            } catch (error) {
                console.error("[CampaignPage] Load error", error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        },
        [
            editable?.campaignId,
            editable?.status,
            editable?.optionIndex,
            initCampaign,
            navigate,
        ],
    );

    React.useEffect(() => {
        let ignore = false;

        const run = async () => {
            if (ignore) return;
            await loadCampaign(reloadKey > 0);
        };

        run();

        return () => {
            ignore = true;
        };
    }, [loadCampaign, reloadKey]);

    const reload = React.useCallback(() => {
        setReloadKey((prev) => prev + 1);
    }, []);

    return {
        editable,
        kind,
        activeOptionIndex,
        isLoading,
        isError,
        reload,
    };
};