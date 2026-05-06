import React from "react";
import { useClickOutside } from "@/hooks/global/useClickOutside";
import styles from "./genres-countries-popover.module.scss";
import type {
    PromoAccountCountry
} from "@/entities/client-side/campaign-creator-page/campaign-promo-account/model/promo-account.types.ts";

type Props = {
    data: {
        musicGenres: string[];
        countries: PromoAccountCountry[];
    };
    isInclude?: boolean;
    isSelected?: boolean;
    open?: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refElement: React.RefObject<HTMLDivElement | null>;
};

export const GenresCountriesPopover: React.FC<Props> = ({
                                                            data,
                                                            isInclude,
                                                            isSelected,
                                                            open = false,
                                                            setOpen,
                                                            refElement,
                                                        }) => {
    useClickOutside(refElement, () => setOpen(false));

    return (
        <div
            data-open={open}
            className={`${styles.popup} ${isSelected ? styles.selected : ""} ${
                isInclude ? styles.include : ""
            }`}
        >
            <div className={styles.content}>
                <div className={styles.rowContent}>
                    <p>
                        ER: <span>5.68%</span>
                    </p>
                    <p>
                        AV: <span>4800</span>
                    </p>
                </div>

                <div className={styles.infoContent}>
                    {data.musicGenres.length > 0 && (
                        <div className={styles.genres}>
                            <h3>Genres</h3>
                            <ul>
                                {data.musicGenres.map((item, i) => (
                                    <li key={`${item}-${i}`}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {data.countries.length > 0 && (
                        <div className={styles.countries}>
                            <h3>Countries</h3>
                            <ul>
                                {data.countries.map((cr, i) => (
                                    <li key={`${cr.country}-${i}`}>
                                        {cr.country} {cr.percentage}%
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};