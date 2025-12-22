import React from "react";
import edit from "../../../../assets/bar-campaign-strategy/edit-3.svg";

interface Props {}

export const PostsUi: React.FC<Props> = () => {
  return (
    <div className="UI-button">
      <img src={edit} alt="" />
      <p>posts: 21</p>
    </div>
  );
};
