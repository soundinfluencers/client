import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import type { CampaignAddedAccount } from "@/types/store/index.types";

type Props = { data: CampaignAddedAccount };

export const NetworkCell: React.FC<Props> = ({ data }) => {
  return (
    <td className="table-campaign-page__td">
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
