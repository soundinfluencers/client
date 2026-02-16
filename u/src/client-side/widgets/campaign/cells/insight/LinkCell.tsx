import React from "react";
import linkIcon from "@/assets/icons/link (1).svg";

type Props = {
  leftIcon?: string;
  url?: string | null;
  leftAlt?: string;
};

export const LinkCell = React.memo(function LinkCell({
  leftIcon,
  url,
  leftAlt = "",
}: Props) {
  const canOpen = Boolean(url);

  const onOpen = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canOpen) return;
      window.open(url as string, "_blank", "noopener,noreferrer");
    },
    [canOpen, url],
  );

  const style = React.useMemo(
    () => (!canOpen ? { opacity: 0.4, cursor: "not-allowed" } : undefined),
    [canOpen],
  );

  return (
    <td className="table-campaign-page__td">
      <div className="link-block">
        {leftIcon && <img src={leftIcon} alt={leftAlt} />}
        <div className="link-block-icon">
          <img onClick={onOpen} src={linkIcon} alt="" style={style} />
        </div>
      </div>
    </td>
  );
});
