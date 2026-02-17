import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import edit from "@/assets/icons/edit.svg";
import bookmark from "@/assets/icons/bookmark.svg";
import link from "@/assets/icons/link (1).svg";

import { formatFollowers } from "@/utils/functions/formatFollowers";
import "@/client-side/styles-table/campaign-view-card.scss";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import React from "react";
import check from "@/assets/icons/check.svg";
import { Link } from "react-router-dom";

interface LiveViewCardProps {
  isMusic?: boolean;
  item: any;
  networks: any[];
}

export const LiveViewCard: React.FC<LiveViewCardProps> = ({
  item,
  networks,
}) => {
  console.log(networks, "awd");
  const [selected, setSelected] = React.useState(0);
  const [dropdown, setDropdown] = React.useState(false);
  return (
    <div className="live-view-card">
      <div className="live-view-card__content">
        <div className="live-view-card__video">
          <div className="video"></div>
        </div>
        <div className="live-view-card__fill-data">
          <h3>Post description</h3>
          <div className="fill-input">
            <img src={edit} alt="" />
            <div className="descr">
              <Dropdown
                isOpen={dropdown}
                onToggle={() => setDropdown((prev) => !prev)}
                selected={
                  <p className="hidden-text">
                    {item?.descriptions?.[selected].description}
                  </p>
                }>
                <ul className="dropdown-list">
                  {item?.descriptions.map((desc: any, optionIndex: number) => (
                    <li
                      title={desc.description}
                      key={desc?._id ?? optionIndex}
                      onClick={() => {
                        setSelected(optionIndex);
                        setDropdown(false);
                      }}>
                      <span
                        className={selected === optionIndex ? "active" : ""}>
                        {optionIndex + 1}
                      </span>{" "}
                      <p className="hidden-text">{desc.description || "-"}</p>
                      {selected === optionIndex && (
                        <img className="check" src={check} alt="" />
                      )}
                    </li>
                  ))}
                </ul>
              </Dropdown>
            </div>
          </div>
        </div>

        {item.socialMediaGroup !== "music" &&
          item.socialMediaGroup !== "press" && (
            <>
              <div className="live-view-card__fill-data">
                <h3>Story Tag</h3>
                <div className="fill-input">
                  <img src={bookmark} alt="" />
                  <p>{item.taggedUser}</p>
                </div>
              </div>

              <div className="live-view-card__fill-data">
                <h3>Story Links</h3>
                <Link target="_blank" to={item.taggedLink}>
                  <div className="fill-input">
                    <img src={link} alt="" />
                    <p className="tagged-link">{item.taggedLink}</p>
                  </div>
                </Link>
              </div>
            </>
          )}

        <div className="live-view-card__fill-data">
          <h3>Audience reach</h3>
          <div className="fill-input-audience">
            <div className="audience">
              <img
                src={getSocialMediaIcon(item.socialMedia as SocialMediaType)}
                alt=""
              />
              <p>{item.socialMedia}</p>
            </div>{" "}
          </div>
        </div>
      </div>

      <div className="live-view-card__fill-data">
        <h3>Networks</h3>
        <div className="network">
          {networks.map((net) => (
            <div className="network__row">
              <div className="network__row-logo">
                {net.logo && <img src={net.logoUrl} alt="" />}
                <p>{formatFollowers(net.followers)}</p>
              </div>
              <p>{net.username}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
