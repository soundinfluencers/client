import React from "react";
import "./genresICountries.scss";

import type {
  Country,
} from "@/types/client/creator-campaign/creator-campaign.types";

import type {ConnectedAccount} from "@/client-side/types/offers.ts";
import {useClickOutside} from "@/hooks/global/useClickOutside.ts";
type musicStyles = {
  musicGenres: string[];
  countries: Country[];
  averageViews: number;
  engagementRate: number
};
interface Props {
  data: musicStyles;
  flag?: boolean;
  activePromo?: ConnectedAccount | undefined;
  isInclude?: boolean;
  open?: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  ref: React.RefObject<HTMLDivElement | null>;
}

export const GenresCountries: React.FC<Props> = ({
  data,
  flag = false,
  activePromo,
  isInclude,
  open = false,
  setOpen,
    ref
}) => {
  useClickOutside(ref, () => setOpen(false));
  return (
    <div
      data-open={open}
      className={`information_popUp ${flag ? "flag" : ""} ${
        activePromo ? "selected" : ""
      } ${isInclude ? "isInclude" : ""}`}>
      <div className="information_popUp__content">
        <div className='information_popUp__rowContent'>
          <p>ER: <span>{Number(data.engagementRate).toFixed((1)) ?? 0}%</span></p>
          <p>AV: <span>{data.averageViews ?? 0}</span></p>
        </div>
        <div className='information_popUp__infoContent'>
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
    </div>
  );
};
