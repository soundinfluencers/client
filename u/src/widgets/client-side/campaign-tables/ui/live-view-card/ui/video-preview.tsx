import React from "react";
import styles from "./live-view-card.module.scss";
import {getVideoBlobUrl} from "@/entities/client-side/campaign-strategy-page/api/preview-file.ts";

type Props = {
    videoUrl?: string | null;
    pathLower?: string;
    className?: string;
};

export const VideoPreview: React.FC<Props> = ({
                                                  videoUrl,
                                                  pathLower,
                                                  className,
                                              }) => {
    const [url, setUrl] = React.useState<string | null>(videoUrl ?? null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        if (videoUrl) return;
        if (!pathLower) return;

        let objectUrl = "";

        const loadVideo = async () => {
            try {
                setLoading(true);
                objectUrl = await getVideoBlobUrl({
                    provider: "dropbox",
                    pathLower,
                });
                setUrl(objectUrl);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        void loadVideo();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [videoUrl, pathLower]);

    return (
        <div className={`${styles.videoUrl} ${className ?? ""}`}>
            {loading ? (
                <div className={styles.loader}>Loading...</div>
            ) : url && !error ? (
                <video src={url} controls preload="metadata" />
            ) : (
                <div className={styles.loader}>Video unavailable</div>
            )}
        </div>
    );
};