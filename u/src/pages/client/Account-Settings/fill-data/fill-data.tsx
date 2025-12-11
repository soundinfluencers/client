import React from "react";
import "./_fill-data.scss";
import type { IUser } from "../../../../types/user/user.types";
interface Props {
  data: IUser;
}

export const FillData: React.FC<Props> = ({ data }) => {
  return <div className="Fill-Data"></div>;
};
