import React from "react";
import "../styles/table-components.scss";

interface Props {
  setView: (i: number) => void;
  view: number | null;
  isProposal?: boolean;
}

export const ViewChange: React.FC<Props> = ({ setView, view, isProposal }) => {
  const proposalTabs = ["Edit View", "Pro View", "Live View"];
  const regularTabs = ["Live View", "Pro View"];

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

    if (isProposal) {
      setView(index);
    } else {
      setView(index);
    }
  };
  console.log(view, "w");
  return (
    <div className="changeView-table">
      <div className="changeView-table__segmented">
        {tabs.map((label, i) => (
          <div
            key={label}
            className={`changeView-table__item ${
              active === (label === "Edit View" ? -1 : i) ? "active" : ""
            }`}
            onClick={() => onSelect(label, i)}
            role="button"
            tabIndex={0}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};
