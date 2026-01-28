import React from "react";
import { BESPOKE_CAMPAIGN_TABS } from "@/constants/client/bespoke-campaign-tabs";
import "./_tab-bar.scss";

interface Props {
  activeTab: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}

export const TabBar: React.FC<Props> = ({ activeTab, onChange }) => {
  return (
    <div className="tab-bar-bespoke">
      <p>Promo type</p>
      <ul>
        {BESPOKE_CAMPAIGN_TABS.map((tabs) => (
          <li
            className={activeTab === tabs.id ? "active" : ""}
            onClick={() => onChange(tabs.id)}
            key={tabs.id}>
            <img src={tabs.icon} alt="" />
            {tabs.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
