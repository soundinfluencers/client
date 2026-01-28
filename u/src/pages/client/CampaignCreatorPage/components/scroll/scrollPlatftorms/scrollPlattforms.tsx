import React from "react";
import "./_scrollPlattforms.scss";

import { getSocialMediaIconPlattform } from "@/constants/social-medias";
import chevron from "@/assets/icons/chevron-right.svg";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { useHorizontalScroll } from "../useScrollHorizontal";

const PLATFORMS = [
  { id: "multipromo", label: "Multi platforms", icon: "multipromo" },
  { id: "instagram", label: "Instagram", icon: "instagram" },
  { id: "tiktok", label: "TikTok", icon: "tiktok" },
  { id: "spotify", label: "Spotify", icon: "spotify" },
  { id: "facebook", label: "Facebook", icon: "facebook" },
  { id: "soundcloud", label: "SoundCloud", icon: "soundcloud" },
  { id: "youtube", label: "YouTube", icon: "youtube" },
  { id: "press", label: "Press", icon: "press" },
] as const;

interface ScrollPlatformsProps {
  selectedPlatform: SocialMediaType;
  onPlatformSelect: (platform: SocialMediaType) => void;
}

export const ScrollPlatforms: React.FC<ScrollPlatformsProps> = ({
  selectedPlatform,
  onPlatformSelect,
}) => {
  const { ref, showArrow, scrollRight } = useHorizontalScroll();

  return (
    <div className="platforms-scroll">
      <div className="platforms-scroll__header">
        <h3>Choose your platforms</h3>
        {showArrow && (
          <img onClick={() => scrollRight()} src={chevron} alt="Chevron icon" />
        )}
      </div>

      <ul ref={ref} className="platforms-scroll__list">
        {PLATFORMS.map((item) => (
          <li
            key={item.id}
            className={item.id === selectedPlatform ? "active" : ""}
            onClick={() => onPlatformSelect(item.id)}>
            <img
              src={getSocialMediaIconPlattform(item.icon)}
              alt={item.label}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
