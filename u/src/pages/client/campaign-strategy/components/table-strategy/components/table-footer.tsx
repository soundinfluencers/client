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
        {columns.map((_, index) => (
          <td
            key={index}
            className={`table-strategy__td  td--footer ${
              index === 0 || index === 1 ? "is-left" : ""
            }`}>
            {index === 0 && <p>Price: {totalPrice}€</p>}
            {index === 1 && <p>{totalFollowers}</p>}
          </td>
        ))}
      </tr>
    </tfoot>
  );
};
