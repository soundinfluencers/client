import React from "react";
import "./_scrollGenre.scss";
import chevron from "../../../assets/icons/chevron-right.svg";
interface Props {
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
}

export const ScrollGenres: React.FC<Props> = ({
  selectedGenre,
  onGenreSelect,
}) => {
  const mockData: { name: string }[] = [
    { name: "Techno (Melodic, Minimal)" },
    { name: "Techno (Hard, Peak)" },
    { name: "Tech House" },
    { name: "House Melodic" },
    { name: "House Afro" },
    { name: "EDM" },
    { name: "D&B" },
    { name: "BASS" },
    { name: "PSY" },
  ];

  return (
    <div className="platforms-scroll">
      <div className="platforms-scroll__header">
        <h3>Select your music genre</h3> <img src={chevron} alt="" />
      </div>
      <ul className="platforms-scroll__list">
        {mockData.map((item) => (
          <li
            key={item.name}
            className={item.name === selectedGenre ? "active" : ""}
            onClick={() => onGenreSelect(item.name)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};
