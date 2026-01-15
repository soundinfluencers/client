import React from "react";
import folder from "@/assets/icons/folder-plus.svg";
import "./save-draft.scss";
interface Props {}

// saving draft (without logic) //

export const SaveDraft: React.FC<Props> = () => {
  return (
    <div className="save-draft">
      <img src={folder} alt="" /> <p>Save Draft</p>
    </div>
  );
};
