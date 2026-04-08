import React from "react";
import "./_tab-bar.scss";
import type {BespokeCampaignTabId} from "@/client-side/pages/bespoke-campaign/model/bespoke-сampaign.types.ts";
import {BESPOKE_CAMPAIGN_TABS} from "@/client-side/constants/bespoke-campaign-tabs.ts";


interface Props {
    activeTab: BespokeCampaignTabId;
    onChange: (tab: BespokeCampaignTabId) => void;
}

export const TabBar: React.FC<Props> = ({ activeTab, onChange }) => {
    return (
        <div className="tab-bar-bespoke">
            <p>Promo type</p>

            <ul>
                {BESPOKE_CAMPAIGN_TABS.map((tab) => (
                    <li
                        key={tab.id}
                        className={activeTab === tab.id ? "active" : ""}
                        onClick={() => onChange(tab.id as BespokeCampaignTabId)}
                    >
                        <img src={tab.icon} alt="" />
                        {tab.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};