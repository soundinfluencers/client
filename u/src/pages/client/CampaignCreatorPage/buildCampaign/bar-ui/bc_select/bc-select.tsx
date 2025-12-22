import React from "react";
import "./_bc_select.scss";
import check from "../../../../../../assets/icons/check.svg";
interface Props {}

import { Dropdown } from "../../../ui/dropdown/dropdown";

export const SelectBudget: React.FC = () => {
  const currencyArr = ["£", "$", "€"];
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(currencyArr[0]);

  return (
    <Dropdown
      selected={`Budget: 100000 ${selected}`}
      isOpen={open}
      onToggle={() => setOpen((prev) => !prev)}>
      <div className="currency">
        <ul>
          {currencyArr.map((cr) => (
            <li
              onClick={() => {
                setSelected(cr);
                setOpen(false);
              }}
              key={cr}>
              {cr}
            </li>
          ))}
        </ul>
      </div>

      <div className="BudgetPopUp__select_price">
        <label htmlFor="price">Price</label>
        <input type="text" id="price" />
      </div>
    </Dropdown>
  );
};
export const SortSelect: React.FC = () => {
  const filtersArr = [
    "Best Match",
    "Lowest Price",
    "Highest Price",
    "Lowest Followers",
    "Highest Followers",
  ];
  const [open, setOpen] = React.useState(false);

  const [selected, setSelected] = React.useState(filtersArr[0]);
  return (
    <Dropdown
      isChange={true}
      selected={selected}
      isOpen={open}
      onToggle={() => setOpen((prev) => !prev)}>
      <ul className="my-sort-list">
        {filtersArr.map((item, i) => (
          <li
            onClick={() => {
              setSelected(item);
              setOpen(false);
            }}
            key={item}>
            {item}
            {item === selected && <img src={check} alt="" />}
          </li>
        ))}
      </ul>
    </Dropdown>
  );
};
