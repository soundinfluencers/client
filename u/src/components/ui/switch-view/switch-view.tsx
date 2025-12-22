import React from "react";
import menu from "../../../assets/icons/menu.svg";
import grid from "../../../assets/icons/grid.svg";
import check from "../../../assets/icons/check.svg";
import "./switch-view.scss";
interface Props {
  view: number;
  setView: (i: number) => void;
  className?: string;
}

export const SwitchView: React.FC<Props> = ({ view, setView, className }) => {
  const arrView = [menu, grid];
  return (
    <div className={`changeView ${className}`}>
      <div className="changeView__content">
        {" "}
        {arrView.map((item, i) => (
          <div
            className={`changeView-check ${view === i ? "active" : ""}`}
            onClick={() => setView(i)}>
            {view === i && <img className="check" src={check} alt="checked" />}
            <img src={item} alt="" />{" "}
          </div>
        ))}
      </div>
    </div>
  );
};
