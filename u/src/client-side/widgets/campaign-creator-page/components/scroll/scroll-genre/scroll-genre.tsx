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
      <div className="genres-scroll">
        <div className="genres-scroll__header">
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

        <ul ref={ref} >
            {GENRES.map((genre) => (
                <li
                    key={genre.id}
                    className={genre.id === selectedGenre ? "active" : ""}
                    onClick={() => onGenreSelect(genre.id)}
                >
                    <span className="genre-label">
                      <span className="genre-label__main">{genre.text}</span>
                        {genre.subText && (
                            <span className="genre-label__sub">{genre.subText}</span>
                        )}
                    </span>
                </li>
            ))}
        </ul>
      </div>
    );
  },
);
