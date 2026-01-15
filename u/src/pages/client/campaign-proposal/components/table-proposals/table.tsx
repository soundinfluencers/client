import React from "react";
import {
  proposalsData,
  ReqData,
  VideoContent,
  Description,
} from "./table-proposals.data";
import trash from "@/assets/icons/trash-2.svg";
import plus from "@/assets/icons/plus-square.svg";

import check from "@/assets/icons/check.svg";
import chevron from "@/assets/icons/chevron-up.svg";
import "./table-proposals.scss";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import type {
  DropdownKey,
  OpenDropdown,
  RowSelections,
} from "./table-proposals.types";
import { DateInput } from "@/components/ui/inputs/date-input/date-input";

export function TableProposals({ changeView }: { changeView: boolean }) {
  const columns = changeView
    ? ["network", "followers", "genres", "countries", "content", "description"]
    : [
        "network",
        "followers",
        "date",
        "content",
        "description",
        "tag",
        "link",
        "brief",
        "action",
      ];

  const titles: Record<string, string> = {
    network: "Networks",
    followers: "Followers",
    genres: "Genres",
    countries: "Top 5 countries",
    date: "Req. date",
    content: "Content",
    description: "Post description",
    tag: "Story tag",
    link: "Story link",
    brief: "Additional brief",
    action: "Actions",
  };
  const [rowSelections, setRowSelections] = React.useState<
    Record<number, RowSelections>
  >(() =>
    proposalsData.reduce((acc, _, index) => {
      acc[index] = {
        date: ReqData[0],
        content: VideoContent[0],
        description: Description[0],
      };
      return acc;
    }, {} as Record<number, RowSelections>)
  );
  const [openDropdown, setOpenDropdown] = React.useState<OpenDropdown>(null);

  const handleToggle = (rowIndex: number, key: DropdownKey) => {
    setOpenDropdown((prev) =>
      prev?.rowIndex === rowIndex && prev.key === key ? null : { rowIndex, key }
    );
  };

  const updateRowSelection = <K extends keyof RowSelections>(
    rowIndex: number,
    key: K,
    value: RowSelections[K]
  ) => {
    setRowSelections((prev) => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        [key]: value,
      },
    }));
  };
  return (
    <div className="table-proposals">
      {/* HEADER */}
      <div className="table-proposals__header">
        {columns.map((key) => (
          <div key={key} className="table-proposals__header-data">
            <div className="header-content">
              {titles[key]}
              {titles[key] === "Followers" && (
                <div className="switch">
                  <img src={chevron} alt="" />
                  <img className="up" src={chevron} alt="" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* BODY */}
      {proposalsData.map((row, i) => (
        <div key={i} className="table-proposals__body-row">
          {columns.map((key) => (
            <div key={key} className="table-proposals__body-data">
              {key === "genres" && Array.isArray(row.genres) && (
                <ul className="ul">
                  {row.genres.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              )}
              {key === "countries" && Array.isArray(row.countries) && (
                <ul className="ul">
                  {row.countries.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              )}
              {key === "date" && (
                <Dropdown
                  isDateInput={
                    (rowSelections[i].date === "BEFORE" ||
                      rowSelections[i].date === "AFTER") && (
                      <DateInput
                        value={rowSelections[i].dateValue}
                        onChange={(value) =>
                          updateRowSelection(i, "dateValue", value)
                        }
                      />
                    )
                  }
                  isOpen={
                    openDropdown?.rowIndex === i && openDropdown.key === "date"
                  }
                  onToggle={() => handleToggle(i, "date")}
                  selected={rowSelections[i].date}>
                  <ul className="table-proposals__body-data__list">
                    {ReqData.map((item, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          updateRowSelection(i, "date", item);

                          if (item === "ASAP") {
                            updateRowSelection(i, "dateValue", "");
                          }

                          setOpenDropdown(null);
                        }}>
                        {item}

                        {rowSelections[i].date === item && (
                          <img className="check" src={check} alt="" />
                        )}
                      </li>
                    ))}
                  </ul>
                </Dropdown>
              )}

              {key === "content" && (
                <Dropdown
                  isOpen={
                    openDropdown?.rowIndex === i &&
                    openDropdown.key === "content"
                  }
                  onToggle={() => handleToggle(i, "content")}
                  isVideo
                  isQueque
                  selected={rowSelections[i].content}>
                  <ul className="table-proposals__body-data__list">
                    {VideoContent.map((item, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          updateRowSelection(i, "content", item);
                          setOpenDropdown(null);
                        }}>
                        {item} {idx + 1}
                        {rowSelections[i].content === item && (
                          <img className="check" src={check} alt="" />
                        )}
                      </li>
                    ))}
                  </ul>
                </Dropdown>
              )}

              {key === "description" && (
                <Dropdown
                  isOpen={
                    openDropdown?.rowIndex === i &&
                    openDropdown.key === "description"
                  }
                  onToggle={() => handleToggle(i, "description")}
                  isQueque
                  selected={rowSelections[i].description}>
                  <ul className="table-proposals__body-data__list">
                    {Description.map((item, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          updateRowSelection(i, "description", item);
                          setOpenDropdown(null);
                        }}>
                        {item} {idx + 1}
                        {rowSelections[i].description === item && (
                          <img className="check" src={check} alt="" />
                        )}
                      </li>
                    ))}
                  </ul>
                </Dropdown>
              )}

              {key !== "genres" && key !== "countries" && (row as any)[key]}
              {key === "action" && (
                <div className="table-proposals__actions">
                  <img src={trash} alt="" />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      {/* ADD ROW */}
      <div className="table-proposals__add-row">
        {columns.map((_, index) => (
          <div
            key={index}
            className={`table-proposals__add-data ${
              index === 0 ? "button-influencer" : ""
            }`}>
            {index === 0 && (
              <button>
                <img src={plus} alt="" /> Add Influencer
              </button>
            )}
          </div>
        ))}
      </div>{" "}
      {/* ADD PRICE */}
      <div className="table-proposals__footer-row">
        {columns.map((_, index) => (
          <div
            key={index}
            className={`table-proposals__footer-data ${
              index === 0 ? "border" : ""
            } ${index === 1 ? "border" : ""}`}>
            {index === 0 && <p>Price: 1599€</p>} {index === 1 && <p>7548900</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
