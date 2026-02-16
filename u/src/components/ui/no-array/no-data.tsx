import React from "react";
import "./no-data.scss";
interface Props {
  children: React.ReactNode;
}

export const NoData: React.FC<Props> = ({ children }) => {
  return <div className="no-data">{children}</div>;
};
