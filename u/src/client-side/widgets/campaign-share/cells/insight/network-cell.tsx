import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import type { CampaignAddedAccount } from "@/types/store/index.types";

type Props = { data: CampaignAddedAccount };

export const NetworkCell = React.memo(function NetworkCell({ data }: Props) {
  const icon = React.useMemo(
    () => getSocialMediaIcon(data.socialMedia as SocialMediaType),
    [data.socialMedia],
  );

  return (
    <td className="table-campaign-page__td">
      <div className="username_row">
        <img src={icon} alt="" />
        <p className="hidden-text" title={data.username}>
          {data.username ?? "-"}
        </p>
      </div>
    </td>
  );
});
