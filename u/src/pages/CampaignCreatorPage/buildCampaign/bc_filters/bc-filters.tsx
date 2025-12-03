import React from "react";
import cross from "../../../../assets/icons/x.svg";
interface Props {
  onToggle: () => void;
}
import "./_bc_filter.scss";
import { FilterSelect } from "./filterSelect";
export const Filters: React.FC<Props> = ({ onToggle }) => {
  const filterArr = [
    {
      title: "Social Media Platforms",
      filters: [
        { filterName: "Instagram", count: 328 },
        { filterName: "TikTok", count: 328 },
        { filterName: "Spotify", count: 328 },
        { filterName: "Facebook", count: 328 },
        { filterName: "SoundCLoud", count: 328 },
        { filterName: "YouTube", count: 328 },
      ],
    },
    {
      title: "Music Genre",
      AndOrFlag: [{ method: "And" }, { method: "Or" }],
      filters: [
        {
          filterName: "Techno",
          count: 328,
          children: [
            { filterName: "Melodic, Minimal", count: 140 },
            { filterName: "Hard, Peak", count: 155 },
          ],
        },
        {
          filterName: "House",
          count: 225,
          children: [
            { filterName: "Tech House", count: 105 },
            { filterName: "Melodic, Afro", count: 35 },
          ],
        },
      ],
    },
    {
      title: "Social Media Platforms",
      filters: [
        { filterName: "Instagram", count: 328 },
        { filterName: "TikTok", count: 328 },
        { filterName: "Spotify", count: 328 },
        { filterName: "Facebook", count: 328 },
        { filterName: "SoundCLoud", count: 328 },
        { filterName: "YouTube", count: 328 },
      ],
    },
    {
      title: "Social Media Platforms",
      filters: [
        { filterName: "Instagram", count: 328 },
        { filterName: "TikTok", count: 328 },
        { filterName: "Spotify", count: 328 },
        { filterName: "Facebook", count: 328 },
        { filterName: "SoundCLoud", count: 328 },
        { filterName: "YouTube", count: 328 },
      ],
    },
  ];
  return (
    <div className="bc_filter">
      <div className="bc_filter__head">
        <h3>Filters</h3>
        <img onClick={onToggle} src={cross} alt="" />
      </div>
      <div className="bc_filter__content">
        {filterArr.map((data, i) => (
          <FilterSelect key={i} data={data} />
        ))}
      </div>
    </div>
  );
};
