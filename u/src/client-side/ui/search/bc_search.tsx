import React from "react";
import "./_bc_search.scss";
import searchIcon from "@/assets/icons/search (1).svg";

interface Props {
  setSearch: (value: string) => void;
  search: string;
  isSearchMode: boolean;
}

export const Search: React.FC<Props> = ({ isSearchMode, setSearch }) => {
  return (
    <div className={`bc_search ${isSearchMode ? "active" : ""}`}>
      <img src={searchIcon} alt="" />
      <input
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        placeholder="Search"
      />
    </div>
  );
};
