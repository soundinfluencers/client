import React from "react";
import "../../scss-module/_bc_select.scss";

import check from "@/assets/icons/check.svg";
type Currency = { key: string; currency: string };
type SortFilter = { key: string; name: string };

interface SelectBudgetProps {
  setBudget: (budget: number) => void;
  setCurrency: (currency: Currency) => void;
  currencySelected: Currency;
  budgetSelected: number;
}
interface SelectSortProps {
  setSelectedFilter: (f: SortFilter) => void;
  selectedFilter: SortFilter;
}

import { Dropdown } from "../../../ui/dropdown/dropdown";
import {
  currencyArr,
  filtersArr,
} from "../../build-campaign.data/build-campaign.data";

export const SelectBudget: React.FC<SelectBudgetProps> = ({
  currencySelected,
  budgetSelected,
  setBudget,
  setCurrency,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dropdown
      selected={`Budget: ${budgetSelected} ${currencySelected.key}`}
      isOpen={open}
      onToggle={() => setOpen((prev) => !prev)}>
      <div className="currency">
        <ul>
          {currencyArr.map((cr) => (
            <li
              className={cr.key === currencySelected.key ? "active" : ""}
              onClick={() => {
                setCurrency(cr);
                setOpen(false);
              }}
              key={cr.key}>
              {cr.key}
            </li>
          ))}
        </ul>
      </div>

      <div className="BudgetPopUp__select_price">
        <label htmlFor="price">Price</label>

        <input
          type="number"
          id="price"
          value={budgetSelected}
          onChange={(e) => setBudget(Number(e.target.value) || 0)}
        />
      </div>
    </Dropdown>
  );
};
export const SortSelect: React.FC<SelectSortProps> = ({
  selectedFilter,
  setSelectedFilter,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dropdown
      isChange={true}
      selected={selectedFilter.name}
      isOpen={open}
      onToggle={() => setOpen((prev) => !prev)}>
      <ul className="my-sort-list">
        {filtersArr.map((item, i) => (
          <li
            onClick={() => {
              setOpen(false);
              setSelectedFilter(item);
            }}
            key={item.key}>
            {item.name}
            {item.name === selectedFilter.name && <img src={check} alt="" />}
          </li>
        ))}
      </ul>
    </Dropdown>
  );
};
