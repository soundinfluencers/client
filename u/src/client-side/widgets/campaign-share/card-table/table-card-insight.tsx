import React from "react";
import imageIcon from "@/assets/icons/image.svg";

import type { CampaignAddedAccount } from "@/types/store/index.types";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { NetworkCell } from "../cells/insight/network-cell";
import { FollowersCell } from "../cells/insight/followers-cell";
import { LinkCell } from "../cells/insight/LinkCell";
import { MetricCell } from "../cells/insight/metric-cell";

type Props = { data: CampaignAddedAccount };

export const TableCard = React.memo(function TableCard({ data }: Props) {
  return (
    <tr className="table-campaign-page__tr">
      <NetworkCell data={data} />
      <FollowersCell data={data} />

      <LinkCell url={(data as any).postLink} />
      <LinkCell leftIcon={imageIcon} url={(data as any).screenshot} />

      <MetricCell value={(data as any).impressions} />
      <MetricCell value={(data as any).like} />
      <MetricCell value={(data as any).comments ?? 0} />
      <MetricCell value={(data as any).saves ?? 0} />
      <MetricCell value={(data as any).shares ?? 0} />
    </tr>
  );
});
