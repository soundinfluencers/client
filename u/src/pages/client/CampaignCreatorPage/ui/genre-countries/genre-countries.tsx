import React from "react";
import "./genresICountries.scss";
import type { Country } from "../../../../../types/creator-campaign/creator-campaign.types";
type musicStyles = {
  musicSubStyles: string[];
  musicStyleOther: string[];
  countries: Country[];
};
interface Props {
  data: musicStyles;
  flag?: boolean;
}

export const GenresCountries: React.FC<Props> = ({ data, flag = false }) => {
  return (
    <div className={`information_popUp ${flag ? "flag" : ""}`}>
      {data.musicSubStyles.length > 0 && data.musicStyleOther.length > 0 && (
        <div className="genres">
          <h3>Genres</h3>
          <ul>
            {data.musicSubStyles.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
            {data.musicStyleOther.map((item, i) => (
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
