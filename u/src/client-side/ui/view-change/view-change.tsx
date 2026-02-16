import React from "react";
import "../styles/table-components.scss";

interface Props {
  setView: (i: number) => void;
  view: number | null;
  isProposal?: boolean;
}

export const ViewChange: React.FC<Props> = ({ setView, view, isProposal }) => {
  const arrView = ["Live View", "Edit View"];
  const arrProposalView = ["Pro View", "Edit View"];

  const onSelect = (nextView: number) => {
    setView(nextView);
  };

  return (
    <div
      className={`changeView-strategy ${
        isProposal ? "changeView-proposal" : ""
      }`}>
      {isProposal && (
        <div
          onClick={() => onSelect(-1)}
          className={`changeView-strategy-checkOUT ${
            view !== 0 && view !== 1 ? "activeOUT" : ""
          }`}>
          {view !== 0 && view !== 1 && <div className="dot"></div>}
          Live Edit
        </div>
      )}

      <div
        className={`changeView-strategy__content ${isProposal ? "mode" : ""}`}>
        {(isProposal ? arrProposalView : arrView).map((item, i) => (
          <div
            key={i}
            className={`changeView-strategy-check ${
              view === i ? "active" : ""
            }`}
            onClick={() => onSelect(i)}>
            {view === i && <div className="dot"></div>}
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
