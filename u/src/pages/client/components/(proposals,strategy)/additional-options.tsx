import React from "react";
import "./proposals-strategy.scss";
import filePlis from "@/assets/bar-home/file-plus.svg";
interface Props {
  onClick: () => void;
}

export const AddinitonalOption: React.FC<Props> = ({ onClick }) => {
  return (
    <div onClick={onClick} className="AddinitonalOption">
      <img src={filePlis} alt="" />
      <p>Create additional proposal option</p>
    </div>
  );
};
