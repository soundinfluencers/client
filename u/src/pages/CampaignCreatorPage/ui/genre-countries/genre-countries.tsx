import React from "react";
import "../../buildCampaign/bc_cards/bc_card/_card-bc_card.scss";
import type { Country } from "../../../../types/creator-campaign/creator-campaign.types";
type musicStyles = {
  musicSubStyles: string[];
  musicStyleOther: string[];
  countries: Country[];
};
interface Props {
  data: musicStyles;
}

export const GenresCountries: React.FC<Props> = ({ data }) => {
  return (
    <div className="information__popUp">
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
