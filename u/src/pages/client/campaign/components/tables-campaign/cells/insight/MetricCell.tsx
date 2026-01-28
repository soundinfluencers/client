import React from "react";

type Props = {
  value: React.ReactNode;
};

export const MetricCell: React.FC<Props> = ({ value }) => {
  return (
    <td className="table-campaign-page__td">
      <p>{value}</p>
    </td>
  );
};
