import type { EditableCampaign } from "@/entities/client-side/campaign/store/campaign.store";
import { StrategyBar } from "./strategy-bar";
import { InsightBar } from "./insight-bar";
import {getCampaignBarMode} from "@/widgets/client-side/campaign/campaign-bar/model/campaign-bar.helpers.ts";


type Props = {
    campaign: EditableCampaign | null;
};

export const CampaignBar = ({ campaign }: Props) => {
    const mode = getCampaignBarMode(campaign);

    if (mode === "strategy") {
        return <StrategyBar campaign={campaign} />;
    }

    return <InsightBar campaign={campaign} />;
};