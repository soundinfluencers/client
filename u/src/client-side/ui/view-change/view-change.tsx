import React from "react";
import "../styles/table-components.scss";
import edit from "@/assets/icons/edit.svg";
import proview from "@/assets/icons/Vector (15).svg";
import liveview from "@/assets/icons/Vector (16).svg";
import type {ViewMode} from "@/client-side/pages/campaign-strategy/types/campaign-strategy.types.ts";
interface Props {
  setView: React.Dispatch<React.SetStateAction<ViewMode>>;
  view: number | null;
  isProposal?: boolean;
}

export const ViewChange: React.FC<Props> = ({ setView, view, isProposal }) => {
  const proposalTabs = [
    {
      label: "Edit View",
      icon: edit,
    },
    {
      label: "Pro View",
      icon: proview,
    },
    // {
    //   label: "Live View",
    //   icon: liveview,
    // },
  ];
  const regularTabs = [
    // {
    //   label: "Live View",
    //   icon: liveview,
    // },
    // {
    //   label: "Pro View",
    //   icon: proview,
    // },
  ];

  const tabs = isProposal ? proposalTabs : regularTabs;

  console.log(view, "view");

  const active = typeof view === "number" ? view : 0;

  const onSelect = (label: string, index: number) => {
    if (label === "Edit View") {
      setView(-1);
      return;
    } else if (label !== "Edit View") {
      setView(1);
    }

    // if (isProposal) {
    //   setView(index);
    // } else {
    //   setView(index);
    // }
  };
  console.log(view, "w");

  return (
    <div className="changeView-table">
      {tabs.length >=1 && (
        <div className="changeView-table__segmented">
          {tabs.map((tab, i) => (
            <div
              key={tab.label}
              className={`changeView-table__item ${
                active === (tab.label === "Edit View" ? -1 : i) ? "active" : ""
              }`}
              onClick={() => onSelect(tab.label, i)}
              role="button"
              tabIndex={0}>
              <img src={tab.icon} alt="" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
