import React from "react";
import "../../scss-module/_bc_search.scss";
import searchIcon from "@/assets/icons/search (1).svg";

interface Props {
  setSearch: (value: string) => void;
  search: string;
}

export const Search: React.FC<Props> = ({ setSearch }) => {
  return (
    <div className="bc_search">
      <img src={searchIcon} alt="" />
      <input
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        placeholder="Search"
      />
    </div>
  );
};
