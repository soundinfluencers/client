import React from "react";
import "./no-data.scss";
interface Props {
  title: string;
}

export const NoData: React.FC<Props> = ({ title }) => {
  return (
    <div className="no-data">
      {" "}
      <p>
        Oops...<br></br> It seems there are no {title}
      </p>
    </div>
  );
};
