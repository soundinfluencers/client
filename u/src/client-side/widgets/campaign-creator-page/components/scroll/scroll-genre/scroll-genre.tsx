import React from "react";
import "./_scrollGenre.scss";

import chevron from "@/assets/icons/chevron-right.svg";

import { GENRES } from "@/client-side/data/genres-platforms";
import { useHorizontalScroll } from "@/client-side/hooks";

interface Props {
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
}

export const ScrollGenres: React.FC<Props> = React.memo(
  ({ selectedGenre, onGenreSelect }) => {
    const { ref, showArrow, scrollRight } = useHorizontalScroll();

    return (
      <div className="platforms-scroll">
        <div className="platforms-scroll__header">
          <h3>Select your music genre</h3>
          {showArrow && (
            <img
              src={chevron}
              alt="scroll right"
              onClick={() => scrollRight()}
              className="platforms-scroll__arrow"
            />
          )}
        </div>

        <ul ref={ref} className="platforms-scroll__list">
          {GENRES.map((name) => (
            <li
              key={name}
              className={name === selectedGenre ? "active" : ""}
              onClick={() => onGenreSelect(name)}>
              {name}
            </li>
          ))}
        </ul>
      </div>
    );
  },
);
