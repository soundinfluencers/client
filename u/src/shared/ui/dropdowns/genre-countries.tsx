import React from "react";
import "./genresICountries.scss";

import type {
  Country,
  IPromoCard,
} from "@/types/client/creator-campaign/creator-campaign.types";
import { useClickOutside } from "@/shared/lib/hooks/useClickOutside";
type musicStyles = {
  musicGenres: string[];
  countries: Country[];
};
interface Props {
  data: musicStyles;
  flag?: boolean;
  activePromo?: IPromoCard | undefined;
  isInclude?: boolean;
  open?: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GenresCountries: React.FC<Props> = ({
  data,
  flag = false,
  activePromo,
  isInclude,
  open = false,
  setOpen,
}) => {
  // const dropdownRef = React.useRef<HTMLDivElement>(null);
  // useClickOutside(dropdownRef, () => setOpen(false));
  return (
    <div
      data-open={open}
      className={`information_popUp ${flag ? "flag" : ""} ${
        activePromo ? "selected" : ""
      } ${isInclude ? "isInclude" : ""}`}>
      <div className="information_popUp__content">
        {data.musicGenres.length > 0 && (
          <div className="genres">
            <h3>Genres</h3>
            <ul>
              {data.musicGenres.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
              {data.musicGenres.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {data.countries.length > 0 && (
          <div className="countries">
            <h3>Countries</h3>
            <ul>
              {data.countries.map((cr, i) => (
                <li key={i}>
                  {cr.country} {cr.percentage}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
