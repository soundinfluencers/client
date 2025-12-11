import React from "react";
import "./_build-compaign.scss";
import filterIcon from "../../../../assets/icons/filter (1).svg";
import { Search } from "./bc_search/bc_search";
import { SelectBudget, SortSelect } from "./bc_select/bc-select";
import { Filters } from "./bc_filters/bc-filters";
import { CardsContainer } from "./bc_cards/cards_content";
import menu from "../../../../assets/icons/menu.svg";
import grid from "../../../../assets/icons/grid.svg";
import check from "../../../../assets/icons/check.svg";
interface Props {}

export const BuildCampaign: React.FC<Props> = () => {
  const [filterFlag, setFilterFlag] = React.useState<boolean>(false);
  const [view, setView] = React.useState<number>(1);
  const [isSmall, setIsSmall] = React.useState(false);
  const arrView = [menu, grid];
  return (
    <div className="build-compaign">
      <div className="build-compaign__title">
        <h2>Build your custom campaign</h2>
        <p>Handpick networks, genres, and budgets to tailor your campaign</p>
      </div>
      <div className="build-compaign__content">
        <div className="toolbar">
          <div className="toolbar__finput">
            <div
              onClick={() => setFilterFlag((prev) => !prev)}
              className={`filter_flag ${filterFlag ? "active" : ""}`}>
              <img src={filterIcon} alt="" />
              <p>Filters</p>
            </div>
            <Search />
          </div>
          <div className="selects">
            {" "}
            <SelectBudget />
            <SortSelect />
          </div>
        </div>
        <div className="changeView">
          <div className="changeView__content">
            {" "}
            {arrView.map((item, i) => (
              <div
                className={`changeView-check ${view === i ? "active" : ""}`}
                onClick={() => setView(i)}>
                {view === i && (
                  <img className="check" src={check} alt="checked" />
                )}
                <img src={item} alt="" />{" "}
              </div>
            ))}
          </div>
        </div>
        <div
          className={`build-compaign__content_functional ${
            isSmall ? "tableAdaptive" : ""
          }`}>
          {" "}
          {filterFlag && (
            <Filters
              isSmall={isSmall}
              onToggle={() => setFilterFlag((prev) => !prev)}
            />
          )}
          <CardsContainer
            isSmall={isSmall}
            setIsSmall={setIsSmall}
            view={view}
          />
        </div>
      </div>
    </div>
  );
};
