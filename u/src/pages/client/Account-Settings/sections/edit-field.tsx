import React from "react";
import { useAccountChange } from "@/store/client/account-settings";
import { Confirm, ReserPassword, SendEmail } from "..";

export const EditPasswordFlow: React.FC = () => {
  const { isEmail, isConfirm } = useAccountChange();

  if (isEmail) {
    return isConfirm ? <Confirm /> : <SendEmail />;
  }
  return <ReserPassword />;
};
