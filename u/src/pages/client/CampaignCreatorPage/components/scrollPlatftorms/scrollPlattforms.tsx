import React from "react";
import "./_scrollPlattforms.scss";
import { getSocialMediaIconPlattform } from "../../../../../constants/social-medias";
import chevron from "../../../../../assets/icons/chevron-right.svg";
import type { SocialMediaType } from "../../../../../types/utils/constants.types";

interface Props {
  selectedPlatform: string;
  onPlatformSelect: (platform: string) => void;
}

export const ScrollPlatforms: React.FC<Props> = ({
  selectedPlatform,
  onPlatformSelect,
}) => {
  const mockData: { name: string; icon: SocialMediaType }[] = [
    { name: "Multi platforms", icon: "multipromo" },
    { name: "Instagram", icon: "instagram" },
    { name: "TikTok", icon: "tiktok" },
    { name: "Spotify", icon: "spotify" },
    { name: "Facebook", icon: "facebook" },
    { name: "SoundCloud", icon: "soundcloud" },
    { name: "YouTube", icon: "youtube" },
    { name: "Press", icon: "press" },
  ];

  return (
    <div className="platforms-scroll">
      <div className="platforms-scroll__header">
        <h3>Choose your platforms</h3>
        <img src={chevron} alt="Chevron icon" />
      </div>
      <ul className="platforms-scroll__list">
        {mockData.map((item) => (
          <li
            key={item.name}
            className={
              item.name.toLocaleLowerCase() === selectedPlatform ? "active" : ""
            }
            onClick={() => onPlatformSelect(item.name.toLocaleLowerCase())}>
            <img src={getSocialMediaIconPlattform(item.icon)} alt={item.name} />
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};
