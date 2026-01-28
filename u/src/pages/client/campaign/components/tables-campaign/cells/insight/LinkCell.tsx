import React from "react";
import linkIcon from "@/assets/icons/link (1).svg";

type Props = {
  leftIcon: string;
  url?: string | null;
  leftAlt?: string;
};

export const LinkCell: React.FC<Props> = ({ leftIcon, url, leftAlt = "" }) => {
  const canOpen = Boolean(url);

  return (
    <td className="table-campaign-page__td">
      <div className="link-block">
        <img src={leftIcon} alt={leftAlt} />
        <div className="link-block-icon">
          <img
            onClick={(e) => {
              e.stopPropagation();
              if (!canOpen) return;
              window.open(url as string, "_blank", "noopener,noreferrer");
            }}
            src={linkIcon}
            alt=""
            style={
              !canOpen ? { opacity: 0.4, cursor: "not-allowed" } : undefined
            }
          />
        </div>
      </div>
    </td>
  );
};
