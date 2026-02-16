import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

type Props = { data: IPromoCard };

export const UsernameCell = React.memo(function UsernameCell({ data }: Props) {
  const icon = React.useMemo(
    () => getSocialMediaIcon(data.socialMedia as SocialMediaType),
    [data.socialMedia],
  );

  return (
    <td className="tableBase__td col-username">
      <div className="username_row">
        <img src={icon} alt="" />
        <p className="hidden-text username" title={data.username}>
          {data.username}
        </p>
      </div>
    </td>
  );
});
