import React from "react";

type Props = {
  value: React.ReactNode;
};

export const MetricCell = React.memo(function MetricCell({ value }: Props) {
  return (
    <td className="tableBase__td">
      <p>{value ?? "-"}</p>
    </td>
  );
});
