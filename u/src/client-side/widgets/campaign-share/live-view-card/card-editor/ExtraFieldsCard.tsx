import React from "react";

import bookmark from "@/assets/icons/bookmark.svg";
import linkIcon from "@/assets/icons/link (1).svg";
import { useUpdateCampaign } from "@/client-side/store";

type Props = {
  canEdit: boolean;
  contentId?: string;
  mergedItem: any;
  showStoryFields: boolean;
};

export const ExtraFieldsCard: React.FC<Props> = ({
  canEdit,
  contentId,
  mergedItem,
  showStoryFields,
}) => {
  const setField = useUpdateCampaign((s) => s.setField);

  if (!showStoryFields) return null;

  return (
    <>
      <div className="live-view-card__fill-data">
        <h3>Story Tag</h3>
        <div className="fill-input">
          <img src={bookmark} alt="" />
          {canEdit && contentId ? (
            <input
              value={mergedItem.taggedUser ?? ""}
              onChange={(e) =>
                setField(contentId, "taggedUser", e.target.value)
              }
              placeholder="Tagged user"
            />
          ) : (
            <p>{mergedItem.taggedUser}</p>
          )}
        </div>
      </div>

      <div className="live-view-card__fill-data">
        <h3>Story Links</h3>
        <div className="fill-input">
          <img src={linkIcon} alt="" />
          {canEdit && contentId ? (
            <input
              value={mergedItem.taggedLink ?? ""}
              onChange={(e) =>
                setField(contentId, "taggedLink", e.target.value)
              }
              placeholder="Tagged link"
            />
          ) : (
            <p>{mergedItem.taggedLink}</p>
          )}
        </div>
      </div>

      <div className="live-view-card__fill-data">
        <h3>Additional brief</h3>
        <div className="fill-input">
          {canEdit && contentId ? (
            <input
              value={mergedItem.additionalBrief ?? ""}
              onChange={(e) =>
                setField(contentId, "additionalBrief", e.target.value)
              }
              placeholder="Additional brief"
            />
          ) : (
            <p>{mergedItem.additionalBrief}</p>
          )}
        </div>
      </div>
    </>
  );
};
