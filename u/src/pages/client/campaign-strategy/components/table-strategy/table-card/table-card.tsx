import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import { DateInput } from "@/components/ui/inputs/date-input/date-input";
import {
  getDropdownOptions,
  ReqData,
  VideoContent,
} from "../table-strategy.data";
import trash from "@/assets/icons/trash-2.svg";
import eye from "@/assets/icons/eye.svg";
interface Props {
  data: {
    network: string;
    followers: string;
    genres: string[];
    countries: string[];
  };
  setDropdownsOpen: React.Dispatch<
    React.SetStateAction<{
      [rowIndex: number]: {
        date: boolean;
        content: boolean;
        postDescription: boolean;
      };
    }>
  >;
  dropdownsOpen: {
    [rowIndex: number]: {
      date: boolean;
      content: boolean;
      postDescription: boolean;
    };
  };
  indexCard: number;
  changeView: boolean;
  isMusic?: boolean;
  items: any;
}

export const TableCard: React.FC<Props> = ({
  data,
  indexCard,
  setDropdownsOpen,
  dropdownsOpen,
  changeView,
  isMusic,
  items,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<string>(ReqData[0]);
  const [selectedPd, setSelectedPd] = React.useState<number>(0);
  const [selectedContent, setSelectedContent] = React.useState<string>(
    VideoContent[0]
  );
  const isDateOpen = dropdownsOpen[indexCard]?.date ?? false;
  const isContentOpen = dropdownsOpen[indexCard]?.content ?? false;
  const isPostDescriptionOpen =
    dropdownsOpen[indexCard]?.postDescription ?? false;
  const isDate = selectedDate === "BEFORE" || selectedDate === "AFTER";

  return (
    <div className="table-strategy__body-row">
      <div className="table-strategy__body-data">
        <p>{data.network} </p>
      </div>
      <div className="table-strategy__body-data">
        <p>{data.followers}</p>
      </div>
      {changeView && (
        <div className="table-strategy__body-data">
          <ul className="ul">
            {data.genres.map((item, i) => (
              <li>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {changeView && (
        <div className="table-strategy__body-data">
          <ul className="ul">
            {data.countries.map((item, i) => (
              <li>{item} </li>
            ))}
          </ul>
        </div>
      )}
      <div className="table-strategy__body-data">
        <Dropdown
          isOpen={isDateOpen}
          onToggle={() =>
            setDropdownsOpen((prev) => ({
              ...prev,
              [indexCard]: { ...prev[indexCard], date: !isDateOpen },
            }))
          }
          selected={
            <div className={`${isDate ? "isDate" : ""}`}>
              <p>{selectedDate}</p>
              {isDate && (
                <DateInput
                  onChange={function (value: string): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              )}
            </div>
          }>
          <ul className="table-strategy__body-data__list">
            {getDropdownOptions("date").map((item, optionIndex) => (
              <li
                onClick={() => {
                  setSelectedDate(item);
                  setDropdownsOpen((prev) => ({
                    ...prev,
                    [indexCard]: { ...prev[indexCard], date: false },
                  }));
                }}
                key={optionIndex}>
                {item}
              </li>
            ))}
          </ul>
        </Dropdown>
      </div>
      <div className="table-strategy__body-data">
        <Dropdown
          isOpen={isContentOpen}
          selected={
            <>
              <p>{selectedContent}</p>
            </>
          }
          onToggle={() =>
            setDropdownsOpen((prev) => ({
              ...prev,
              [indexCard]: { ...prev[indexCard], content: !isContentOpen },
            }))
          }>
          <ul className="table-strategy__body-data__list">
            {getDropdownOptions("content").map((item, optionIndex) => (
              <li
                onClick={() => {
                  setSelectedContent(item);
                  setDropdownsOpen((prev) => ({
                    ...prev,
                    [indexCard]: { ...prev[indexCard], content: false },
                  }));
                }}
                key={optionIndex}>
                <div className="eye">
                  <img src={eye} alt="" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </Dropdown>
      </div>{" "}
      <div className="table-strategy__body-data">
        <Dropdown
          isOpen={isPostDescriptionOpen}
          selected={
            <>
              <p>
                {items?.map(
                  (pd) => pd.postDescriptions?.[selectedPd].description
                )}
              </p>
            </>
          }
          onToggle={() =>
            setDropdownsOpen((prev) => ({
              ...prev,
              [indexCard]: {
                ...prev[indexCard],
                postDescription: !isPostDescriptionOpen,
              },
            }))
          }>
          <ul className="table-strategy__body-data__list">
            {items?.map((pd) =>
              pd.postDescriptions?.map((item, optionIndex) => (
                <li
                  onClick={() => {
                    setSelectedPd(optionIndex);
                    setDropdownsOpen((prev) => ({
                      ...prev,
                      [indexCard]: {
                        ...prev[indexCard],
                        postDescription: false,
                      },
                    }));
                  }}
                  key={optionIndex}>
                  {item?.description}
                </li>
              ))
            )}
          </ul>
        </Dropdown>
      </div>
      {!changeView &&
        (() => {
          const fields = isMusic
            ? ["spotifyTrackLink", "trackTitle", "Additional brief"]
            : ["Story tag", "Story link", "Additional brief"];

          return fields.map((key) => (
            <div key={key} className="table-strategy__body-data">
              {items?.map((obj, objIndex) => (
                <p key={`${key}-${objIndex}`}>{obj[key] || "—"}</p>
              ))}
            </div>
          ));
        })()}
      {!changeView && (
        <div className="table-strategy__body-data">
          <img src={trash} alt="" />
        </div>
      )}
    </div>
  );
};
