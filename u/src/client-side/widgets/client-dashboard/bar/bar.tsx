import React from "react";
import "./_bar.scss";

import { useWindowSize } from "@/hooks/global/useWindowSize";
import draft from "@/assets/bar-home/folder-plus (1).svg";
import edit from "@/assets/bar-home/edit-2.svg";
import UnderReviewIcon from "@/assets/bar-home/si_hourglass-duotone.svg";
import DistributingIcon from "@/assets/bar-home/distribution icon.svg";
import CompletedIcon from "@/assets/bar-home/check-circle.svg";
import type { CampaignStatusType } from "@/types/client/dashboard/campaign.types";
import { SwitchView } from "@/client-side/ui";

export type ListDisplayMode = "grid" | "table";
export type CampaignFilterStatus = CampaignStatusType | "all";
interface Props {
  status: CampaignFilterStatus;
  view: number;
  setView: (v: number) => void;
  onStatusChange: (status: CampaignFilterStatus) => void;
}
const feutures = [
  { key: "draft", name: "Drafts", icon: draft },
  { key: "proposal", name: "Proposals", icon: edit },
  { key: "under_review", name: "Under Review", icon: UnderReviewIcon },
  { key: "distributing", name: "Distributing", icon: DistributingIcon },
  { key: "closed", name: "Completed", icon: CompletedIcon },
];
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
        <p>Campaigns</p>{" "}
        {width < 901 && (
          <SwitchView className="base" view={view} setView={setView} />
        )}
      </div>
      <div className="bar-home__content">
        <div className="bar-home__feutures">
          {feutures.map((item, i) => {
            const isActive = status === item.key;

            return (
              <div
                key={i}
                onClick={() => onChange(item.key as CampaignFilterStatus)}
                className={`action-button ${isActive ? "active" : ""} ${
                  item.key === "closed" ? (width > 870 ? "radius" : "") : ""
                }`}>
                <img src={item.icon} alt="" />
                <p>{item.name}</p>
                {isActive ? (
                  <div className="dot" />
                ) : (
                  <div className="dot-hidden" />
                )}
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
