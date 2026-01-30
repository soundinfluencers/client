import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import type { NetworkRowResolved } from "../../types";

export const NetworkCell: React.FC<{ data: NetworkRowResolved }> = ({
  data,
}) => {
  return (
    <td className="table-campaign-page__td col-network">
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
