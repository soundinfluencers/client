import React from "react";
import "./_bar.scss";
import { useWindowSize } from "@/hooks/global/useWindowSize";
import { SwitchView } from "@/client-side/ui";
import {DASHBOARD_STATUS_OPTIONS} from "@/client-side/pages/client-dashboard/model/dashboard.constants.ts";
import type {
  CampaignFilterStatus,
  CampaignListViewMode
} from "@/client-side/pages/client-dashboard/model/dashboard.types.ts";



interface Props {
  status: CampaignFilterStatus;
  view: CampaignListViewMode;
  setView: (v: CampaignListViewMode) => void;
  onStatusChange: (status: CampaignFilterStatus) => void;
}

export const BarDashboard: React.FC<Props> = ({
                                                status,
                                                view,
                                                setView,
                                                onStatusChange,
                                              }) => {
  const { width } = useWindowSize();

  const onChange = (next: CampaignFilterStatus) => {
    onStatusChange(status === next ? "all" : next);
  };

  return (
      <div className="bar-home">
        <div className="bar-home__title">
          <p>Campaigns</p>
          {width < 901 && (
              <SwitchView className="base" view={view} setView={setView} />
          )}
        </div>

        <div className="bar-home__content">
          <div className="bar-home__feutures">
            {DASHBOARD_STATUS_OPTIONS.map((item) => {
              const isActive = status === "all" || status === item.key;

              return (
                  <div
                      key={item.key}
                      onClick={() => onChange(item.key)}
                      className={`action-button ${isActive ? "active" : ""} ${
                          item.key === "closed" && width > 870 ? "radius" : ""
                      }`}
                  >
                    <img src={item.icon} alt="" />
                    <p>{item.name}</p>
                    {isActive ? <div className="dot" /> : <div className="dot-hidden" />}
                  </div>
              );
            })}
          </div>

          {width > 901 && (
              <SwitchView className="base" view={view} setView={setView} />
          )}
        </div>
      </div>
  );
};