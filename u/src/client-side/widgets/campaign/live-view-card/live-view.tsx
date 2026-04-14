import React from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import "@/client-side/styles-table/campaign-view-card.scss";
import { PreviewPhoto } from "./preview/preview-component";
import { ModalVideo } from "@/shared/ui/modal-video/ModalVideo";
import { VideoPreview } from "./preview/preview-video-component";
import { ExtraFieldsCard } from "./card-editor/ExtraFieldsCard";
import { useContentMerged } from "./card-editor/use-content-meged";
import { useUpdateCampaign } from "@/client-side/store";
import { LiveDescriptionsEditorDropdown } from "./card-editor/PostDescriptionsEditor";

interface LiveViewCardProps {
  isMusic?: boolean;
  item: any;
  networks: any[];
  canEdit?: boolean;
}

export type Desc = {
  _id?: string;
  description: string;
};

export const LiveViewCard: React.FC<LiveViewCardProps> = ({
                                                            item,
                                                            networks,
                                                            canEdit,
                                                          }) => {
  const contentId = item?._id as string | undefined;
  console.log("item", item);
  console.log("networks", networks);
  const { merged } = useContentMerged(contentId, item);
  const isMusic = merged.socialMediaGroup === "music";
  const isPress = merged.socialMediaGroup === "press";

  const showStoryTag = !isMusic && !isPress;
  const showStoryLink = !isMusic;

  const [isVideoOpen, setIsVideoOpen] = React.useState(false);
  const [descOpen, setDescOpen] = React.useState(false);
  const [selectedDescIdx, setSelectedDescIdx] = React.useState(0);

  const media0 = item?.mediaCache?.items?.[0];
  const pathLower = media0?.pathLower;
  const videoUrl = media0?.url ?? null;
  const hasVideo = Boolean(pathLower);

  const patch = useUpdateCampaign((s) =>
      contentId ? s.patches[contentId] : undefined,
  );
  const addDescription = useUpdateCampaign((s) => s.addDescription);
  const updateDescription = useUpdateCampaign((s) => s.updateDescription);
  const removeDescription = useUpdateCampaign((s) => s.removeDescription);
  const setDescriptions = useUpdateCampaign((s) => s.setDescriptions);

  const serverDescs = (item?.descriptions ?? []) as Desc[];
  const editingDescs = (patch?.descriptions ?? serverDescs) as Desc[];

  const ensurePatchDescs = React.useCallback(() => {
    if (!contentId) return;
    if (patch?.descriptions) return;

    setDescriptions(
        contentId,
        (serverDescs ?? []).map((d: any) => ({
          _id: String(d?._id ?? ""),
          description: String(d?.description ?? ""),
        })),
    );
  }, [contentId, patch?.descriptions, serverDescs, setDescriptions]);

  React.useEffect(() => {
    setSelectedDescIdx(0);
  }, [contentId]);

  React.useEffect(() => {
    if (!editingDescs.length) {
      setSelectedDescIdx(0);
      return;
    }

    setSelectedDescIdx((prev) =>
        prev > editingDescs.length - 1 ? editingDescs.length - 1 : prev,
    );
  }, [editingDescs]);

  const titleByGroup = (group: string) => {
    if (group === "music") return "Track title";
    if (group === "press") return "Artwork link";
    return "Post description";
  };

  const title = titleByGroup(merged.socialMediaGroup);

  return (
      <div className="live-view-card">
        <div className="live-view-card__content">
          <div className="live-view-card__video">
            <div
                role={hasVideo ? "button" : undefined}
                style={{ cursor: hasVideo ? "pointer" : "default" }}
                onClick={() => {
                  if (!hasVideo) return;
                  setIsVideoOpen(true);
                }}
            >
              <PreviewPhoto
                  previewUrl={media0?.previewUrl}
                  pathLower={media0?.pathLower}
                  fileId={media0?.fileId}
              />
            </div>
          </div>

          <LiveDescriptionsEditorDropdown
              title={title}
              canEdit={canEdit ?? false}
              contentId={contentId}
              editingDescs={editingDescs}
              isOpen={descOpen}
              onToggle={() => setDescOpen((prev) => !prev)}
              onClose={() => setDescOpen(false)}
              selectedIdx={selectedDescIdx}
              setSelectedIdx={setSelectedDescIdx}
              ensurePatch={ensurePatchDescs}
              addDescription={addDescription}
              updateDescription={updateDescription}
              removeDescription={removeDescription}
              resetDescriptions={() => {
                if (!contentId) return;
                setDescriptions(contentId, serverDescs);
                setSelectedDescIdx(0);
              }}
              setDescriptions={setDescriptions}
              onSelectDescriptionId={(descriptionId) => {
                console.log("selected description id:", descriptionId);
              }}
          />

          <ExtraFieldsCard
              canEdit={canEdit ?? false}
              contentId={contentId}
              mergedItem={merged}
              showStoryTag={showStoryTag}
              showStoryLink={showStoryLink}
          />

          <div className="live-view-card__fill-data">
            <h3>Audience reach</h3>
            <div className="fill-input-audience">
              <div className="audience">
                <img
                    src={getSocialMediaIcon(item.socialMedia as SocialMediaType)}
                    alt=""
                />
                <p>{item.socialMedia}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="live-view-card__fill-data">
          <h3>Networks</h3>
          <div className="network">
            {networks.map((net) => (
                <div className="network__row" key={net.addedAccountsId ?? net.socialAccountId ?? net.username}>
                  <div className="network__row-logo">
                    {net.logoUrl && <img src={net.logoUrl} alt="logo" />}
                    <p>{formatFollowers(net.followers)}</p>
                  </div>
                  <p>{net.username}</p>
                </div>
            ))}
          </div>
        </div>

        {isVideoOpen && (
            <ModalVideo
                className="modal-block"
                onClose={() => setIsVideoOpen(false)}
            >
              <VideoPreview videoUrl={videoUrl} pathLower={pathLower} />
            </ModalVideo>
        )}
      </div>
  );
};