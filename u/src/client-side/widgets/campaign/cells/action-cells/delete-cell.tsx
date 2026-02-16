import React from "react";
import trash from "@/assets/icons/trash-2.svg";
import { useProposalAccountsStore } from "@/client-side/store";
import { getAccountKey } from "@/client-side/utils";

export const ActionCell: React.FC<{ data: any; optionIndex: number }> = ({
  data,
  optionIndex,
}) => {
  const removeAccount = useProposalAccountsStore((s) => s.removeAccount);

  const onDelete = () => {
    removeAccount(optionIndex, getAccountKey(data));
  };

  return (
    <td className="tableBase__td trash-action">
      <div onClick={onDelete} className="trash-action__content">
        <img src={trash} alt="" />
      </div>
    </td>
  );
};
