import React from "react";
import "./_bar.scss";

import { SwitchView } from "@/components";
import { useWindowSize } from "@/hooks/global/useWindowSize";
import draft from "@/assets/bar-home/folder-plus (1).svg";
import edit from "@/assets/bar-home/edit-2.svg";
import UnderReviewIcon from "@/assets/bar-home/si_hourglass-duotone.svg";
import DistributingIcon from "@/assets/bar-home/distribution icon.svg";
import CompletedIcon from "@/assets/bar-home/check-circle.svg";
import type { CampaignFilterStatus, ListDisplayMode } from "../../../types";

interface Props {
  view: number;
  setView: (v: number) => void;
  onStatusChange: (status: CampaignFilterStatus) => void;
}
const feutures = [
  { key: "all", name: "All" },
  { key: "draft", name: "Drafts", icon: draft },
  { key: "proposal", name: "Proposals", icon: edit },
  { key: "under_review", name: "Under Review", icon: UnderReviewIcon },
  { key: "distributing", name: "Distributing", icon: DistributingIcon },
  { key: "closed", name: "Completed", icon: CompletedIcon },
];
export const Bar: React.FC<Props> = ({ view, setView, onStatusChange }) => {
  const [active, setActive] = React.useState(feutures[0].key);
  const { width } = useWindowSize();
  const onChange = (item: CampaignFilterStatus) => {
    onStatusChange(item);
    setActive(item);
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
          {feutures.map((item, i) => (
            <div
              key={i}
              onClick={() => onChange(item.key as CampaignFilterStatus)}
              className={`action-button ${active === item.key ? "active" : ""} ${item.key === "closed" ? (width > 870 ? "radius" : "") : ""}`}>
              <img src={item.icon} alt="" />
              <p>{item.name}</p>
              {active === item.key ? (
                <div className="dot"></div>
              ) : (
                <div className="dot-hidden"></div>
              )}
            </div>
          ))}
        </div>
        {width > 901 && (
          <SwitchView className="base" view={view} setView={setView} />
        )}
      </div>
    </div>
  );
};
