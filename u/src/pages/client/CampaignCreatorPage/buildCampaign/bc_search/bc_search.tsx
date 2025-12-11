import React from "react";
import searchIcon from "../../../../../assets/icons/search (1).svg";
import "./_bc_search.scss";
interface Props {}

export const Search: React.FC<Props> = () => {
  return (
    <div className="bc_search">
      <img src={searchIcon} alt="" />
      <input type="text" placeholder="Search" />
    </div>
  );
};
