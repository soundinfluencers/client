import React from "react";
import creditcard from "../../../../assets/bar-campaign-strategy/credit-card.svg";

interface Props {}

export const BudgetUi: React.FC<Props> = () => {
  return (
    <div className="UI-button">
      <img src={creditcard} alt="" />
      <p>Budget: 1,599€</p>
    </div>
  );
};
