import React from "react";
import "./genresICountries.scss";
import type {
  Country,
  IPromoCard,
} from "@/types/client/creator-campaign/creator-campaign.types";
type musicStyles = {
  musicGenres: string[];
  countries: Country[];
};
interface Props {
  data: musicStyles;
  flag?: boolean;
  activePromo?: IPromoCard | undefined;
}

export const GenresCountries: React.FC<Props> = ({
  data,
  flag = false,
  activePromo,
}) => {
  return (
    <div
      className={`information_popUp ${flag ? "flag" : ""} ${
        activePromo ? "selected" : ""
      }`}>
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
  );
};
