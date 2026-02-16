import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import type { CampaignAddedAccount } from "@/types/store/index.types";
import "@/client-side/styles-table/campaign-view-card.scss";

import { ExtraFieldsCard } from "./card-editor/ExtraFieldsCard";
import { PostDescriptionsEditor } from "./card-editor/PostDescriptionsEditor";
import { useContentMerged } from "./card-editor/use-content-meged";

interface LiveViewCardProps {
  item: any; // campaignContentItem
  networks: CampaignAddedAccount[];
  canEdit: boolean;
}

export const LiveViewCard: React.FC<LiveViewCardProps> = ({
  item,
  networks,
  canEdit,
}) => {
  const contentId = item?._id as string | undefined;

  const { merged } = useContentMerged(contentId, item);

  const showStoryFields =
    merged.socialMediaGroup !== "music" && merged.socialMediaGroup !== "press";

  return (
    <div className="live-view-card">
      <div className="live-view-card__content">
        <div className="live-view-card__video">
          <div className="video"></div>
        </div>

        <PostDescriptionsEditor
          canEdit={canEdit}
          contentId={contentId}
          serverDescs={item?.descriptions ?? []}
          editingDescs={merged.descriptions ?? []}
        />

        <ExtraFieldsCard
          canEdit={canEdit}
          contentId={contentId}
          mergedItem={merged}
          showStoryFields={showStoryFields}
        />

        <div className="live-view-card__fill-data">
          <h3>Audience reach</h3>
          <div className="fill-input-audience">
            <div className="audience">
              <img
                src={getSocialMediaIcon(merged.socialMedia as SocialMediaType)}
                alt=""
              />
              <p>{merged.socialMedia}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="live-view-card__fill-data">
        <h3>Networks</h3>
        <div className="network">
          {networks.map((net, i) => (
            <div className="network__row" key={(net as any)._id ?? i}>
              <div className="network__row-logo">
                <p>{formatFollowers((net as any).followers)}</p>
              </div>
              <p>{(net as any).username}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
