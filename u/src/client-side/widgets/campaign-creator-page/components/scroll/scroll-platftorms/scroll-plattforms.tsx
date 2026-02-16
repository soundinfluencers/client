import React from "react";
import "./_scrollPlattforms.scss";

import { getSocialMediaIconPlattform } from "@/constants/social-medias";
import chevron from "@/assets/icons/chevron-right.svg";
import type { SocialMediaType } from "@/types/utils/constants.types";

import { PLATFORMS } from "@/client-side/data/genres-platforms";
import { useHorizontalScroll } from "@/client-side/hooks";

interface ScrollPlatformsProps {
  selectedPlatform: SocialMediaType;
  onPlatformSelect: (platform: SocialMediaType) => void;
}

export const ScrollPlatforms: React.FC<ScrollPlatformsProps> = React.memo(
  ({ selectedPlatform, onPlatformSelect }) => {
    const { ref, showArrow, scrollRight } = useHorizontalScroll();

    return (
      <div className="platforms-scroll">
        <div className="platforms-scroll__header">
          <h3>Choose your platforms</h3>
          {showArrow && (
            <img
              onClick={() => scrollRight()}
              src={chevron}
              alt="Chevron icon"
            />
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
  },
);
