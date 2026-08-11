import React, { useMemo } from "react";
import chevron from "@/assets/icons/chevron-right.svg";
import { type GenreId, getGenresByPlatform } from "../model/use-genre-param";
import styles from "./genre-scroll.module.scss";
import {useHorizontalScroll} from "@/features/client-side/campaign-creator-page/lib/use-horizontal-scroll.ts";
import type {
  PlatformKey
} from "@/features/client-side/campaign-creator-page/select-platform/model/use-platform-param.ts";

type Props = {
  selectedGenre: GenreId;
  selectedPlatform: PlatformKey;
  onGenreSelect: (genre: GenreId) => void;
};

export const GenreScroll: React.FC<Props> = React.memo(
    ({ selectedGenre, selectedPlatform, onGenreSelect }) => {
        const { ref, showRightArrow, showLeftArrow, scrollRight, scrollLeft } =
            useHorizontalScroll<HTMLUListElement>();

      const genres = useMemo(
        () => getGenresByPlatform(selectedPlatform),
        [selectedPlatform],
      );

        return (
            <div className={styles.root}>
                <div className={styles.header}>
                    <h3>Select your music genre</h3>

                    <div className={styles.arrows}>
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

                <ul ref={ref} className={styles.list}>
                    {genres.map((genre) => (
                        <li
                            key={genre.id}
                            className={genre.id === selectedGenre ? styles.active : ""}
                            onClick={() => onGenreSelect(genre.id)}
                        >
              <span className={styles.genreLabel}>
                <span className={styles.genreMain}>{genre.text}</span>
                  {genre.subText ? (
                      <span className={styles.genreSub}>{genre.subText}</span>
                  ) : null}
              </span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    },
);
