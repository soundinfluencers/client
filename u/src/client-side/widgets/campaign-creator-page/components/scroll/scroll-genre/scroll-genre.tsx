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
    const { ref, showRightArrow, showLeftArrow, scrollRight, scrollLeft } =
      useHorizontalScroll();

    return (
      <div className="platforms-scroll">
        <div className="platforms-scroll__header">
          <h3>Select your music genre</h3>
          <div className="arrows">
            {showLeftArrow && (
              <img
                onClick={() => scrollLeft()}
                src={chevron}
                alt="Left"
                style={{ transform: "rotate(180deg)" }}
              />
            )}

            {showRightArrow && (
              <img onClick={() => scrollRight()} src={chevron} alt="Right" />
            )}
          </div>
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
