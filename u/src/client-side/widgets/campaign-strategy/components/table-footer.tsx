import React from "react";

type Props = {
  columns: string[];
  totalPrice: number;
  totalFollowers: number;
};

export const TableFooter: React.FC<Props> = ({
  columns,
  totalPrice,
  totalFollowers,
}) => {
  return (
    <tfoot>
      <tr>
        {columns.map((col) => {
          const isPrice = col === "network";
          const isFollowers = col === "followers";

          return (
            <td
              key={col}
              className={`tableBase__td td--footer ${isPrice ? "td--footer-strategy" : ""} ${isFollowers ? "td--footer-strategy" : ""}`}>
              {isPrice && <p className="td__price">Price: {totalPrice}€</p>}
              {isFollowers && <p className="td__followers">{totalFollowers}</p>}
            </td>
          );
        })}
      </tr>
    </tfoot>
  );
};
