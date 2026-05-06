import React from "react";
import { getSocialMediaIconPlattform } from "@/constants/social-medias";
import chevron from "@/assets/icons/chevron-right.svg";
import {
    PLATFORMS,
    type PlatformKey,
} from "../model/use-platform-param";
import styles from "./platform-scroll.module.scss";
import { useHorizontalScroll } from "@/features/client-side/campaign-creator-page/lib/use-horizontal-scroll.ts";

type Props = {
    selectedPlatformKey: PlatformKey;
    onPlatformSelect: (platformKey: PlatformKey) => void;
};

export const PlatformScroll: React.FC<Props> = React.memo(
    ({ selectedPlatformKey, onPlatformSelect }) => {
        const { ref, showRightArrow, showLeftArrow, scrollRight, scrollLeft } =
            useHorizontalScroll<HTMLUListElement>();

        return (
            <div className={styles.root}>
                <div className={styles.header}>
                    <h3>Choose your platforms</h3>

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
                    {PLATFORMS.map((item) => {
                        const isActive = item.key === selectedPlatformKey;

                        return (
                            <li
                                key={item.key}
                                className={isActive ? styles.active : ""}
                                onClick={() => onPlatformSelect(item.key)}
                            >
                                <img
                                    src={getSocialMediaIconPlattform(item.icon) || ""}
                                    alt={item.label}
                                />
                                {item.label}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    },
);