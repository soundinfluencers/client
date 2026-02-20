import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";

export const NetworkCell = React.memo(({ data }: { data: any }) => {
  return (
    <td className="tableBase__td col-network">
      <div className="username_row">
        <img
          src={getSocialMediaIcon(data.socialMedia as SocialMediaType)}
          alt=""
        />
        <p className="hidden-text username" title={data.username}>
          {data.username}
        </p>
      </div>
    </td>
  );
});
