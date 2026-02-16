import React from "react";
import trash from "@/assets/icons/trash-2.svg";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

export const ActionCell: React.FC<{ data: IPromoCard }> = ({ data }) => {
  return (
    <td className="tableBase__td trash">
      <img src={trash} alt="" />
    </td>
  );
};
