import React from "react";
import {
  getDropdownOptions,
  proposalsData,
  ReqData,
  titles,
} from "./table-strategy.data";
import plus from "@/assets/icons/plus-square.svg";
import chevron from "@/assets/icons/chevron-up.svg";

import "./table-strategy.scss";

import { getColumns } from "./utils/getColums";
import { TableCard } from "./table-card/table-card";
import { useCampaignStore } from "@/store/client/createCampaign";

export function TableStrategy({
  changeView,
  items,
  isMusic,
}: {
  isMusic?: boolean;
  changeView: boolean;
  items: any;
}) {
  console.log("items", items);
  const { totalPrice } = useCampaignStore();
  const columns = getColumns(changeView, isMusic);

  const [dropdownsOpen, setDropdownsOpen] = React.useState<{
    [rowIndex: number]: {
      date: boolean;
      content: boolean;
      postDescription: boolean;
    };
  }>({});

  return (
    <div className="table-strategy">
      {/* HEADER */}
      <div className="table-strategy__header">
        {columns.map((key) => (
          <div key={key} className="table-strategy__header-data">
            <div className="header-content">
              {titles[key]}

              {/* for followers */}
              {titles[key] === "Followers" && (
                <div className="switch">
                  <img src={chevron} alt="" />
                  <img className="up" src={chevron} alt="" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {proposalsData.map((row, i) => (
        <TableCard
          items={items}
          isMusic={isMusic}
          changeView={changeView}
          key={i}
          indexCard={i}
          data={row}
          setDropdownsOpen={setDropdownsOpen}
          dropdownsOpen={dropdownsOpen}
        />
      ))}

      {/* ADD PRICE */}
      <div className="table-strategy__footer-row">
        {columns.map((_, index) => (
          <div
            key={index}
            className={`table-strategy__footer-data ${
              index === 0 ? "border" : ""
            } ${index === 1 ? "border" : ""}`}>
            {index === 0 && <p>Price: {totalPrice}€</p>}{" "}
            {index === 1 && <p>7548900</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
