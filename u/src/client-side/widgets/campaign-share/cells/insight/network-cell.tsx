import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import type { CampaignAddedAccount } from "@/types/store/index.types";

type Props = { data: CampaignAddedAccount };

export const NetworkCell = React.memo(({ data }: Props) => {

  const icon = React.useMemo(
    () => getSocialMediaIcon(data.socialMedia as SocialMediaType),
    [data.socialMedia],
  );

  return (
    <td className="tableBase__tdpage__td col-network">
      <div className="username_row">
        <img src={icon} alt="" />
        <span
          className="tooltip-wrap">
          <p className="hidden-text username" title={data.username}>
            {data.username}
          </p>

        </span>
      </div>
    </td>
  );
});
