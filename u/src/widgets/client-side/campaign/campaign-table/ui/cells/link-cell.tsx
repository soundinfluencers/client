import React from "react";

import linkIcon from "@/assets/icons/link (1).svg";
import imageIcon from "@/assets/icons/image.svg";

import styles from "./cells.module.scss";

type Props = {
    url?: string | null;
    type?: "link" | "image";
};

const normalizeUrl = (url?: string | null) => {
    const preparedUrl = String(url ?? "").trim();

    if (!preparedUrl) return "";

    if (/^(https?:)?\/\//i.test(preparedUrl)) {
        return preparedUrl.startsWith("//")
            ? `https:${preparedUrl}`
            : preparedUrl;
    }

    if (/^(mailto:|tel:)/i.test(preparedUrl)) {
        return preparedUrl;
    }

    return `https://${preparedUrl}`;
};

export const LinkCell = ({ url, type = "link" }: Props) => {
    const preparedUrl = normalizeUrl(url);
    const canOpen = Boolean(preparedUrl);

    const onOpen = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!canOpen) return;

        window.open(preparedUrl, "_blank", "noopener,noreferrer");
    };

    if (type === "image") {
        return (
            <div className={`${styles.linkBlock} ${styles.screenshotLinkBlock}`}>
                <img
                    className={styles.screenshotIcon}
                    src={imageIcon}
                    alt=""
                />

                <button
                    type="button"
                    className={`${styles.linkButton} ${
                        !canOpen ? styles.disabled : ""
                    }`}
                    onClick={onOpen}
                    disabled={!canOpen}
                >
                    <img src={linkIcon} alt="" />
                </button>
            </div>
        );
    }

    return (
        <div className={styles.linkBlock}>
            <button
                type="button"
                className={`${styles.linkButton} ${
                    !canOpen ? styles.disabled : ""
                }`}
                onClick={onOpen}
                disabled={!canOpen}
            >
                <img src={linkIcon} alt="" />
            </button>
        </div>
    );
};