import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export const UsernameCell: React.FC<{ data: IPromoCard }> = ({ data }) => {
  return (
    <td className="table-strategy__td col-username">
      <div className="username_row">
        <img
          src={getSocialMediaIcon(data.socialMedia as SocialMediaType)}
          alt=""
        />
        <p className="ellipsis" title={data.username}>
          {data.username}
        </p>
      </div>
    </td>
  );
};
