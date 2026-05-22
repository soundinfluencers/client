import React from "react";
import styles from "./live-view-card.module.scss";
import { getVideoBlobUrl } from "@/entities/client-side/campaign-strategy-page/api/preview-file.ts";
import {resolveVideoUrl} from "@/widgets/client-side/campaign-tables/model/media-url.helpers.ts";


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
    const [url, setUrl] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        let objectUrl = "";

        const loadVideo = async () => {
            try {
                setError(false);
                setLoading(true);

                const externalUrl = resolveVideoUrl({
                    url: videoUrl,
                    pathLower,
                });

                if (externalUrl) {
                    setUrl(externalUrl);
                    return;
                }

                if (pathLower) {
                    objectUrl = await getVideoBlobUrl({
                        provider: "dropbox",
                        pathLower,
                    });

                    setUrl(objectUrl);
                    return;
                }

                setUrl(null);
                setError(true);
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
                url.includes("drive.google.com") ? (
                    <iframe
                        src={url}
                        allow="autoplay"
                        allowFullScreen
                    />
                ) : (
                    <video src={url} controls preload="metadata" />
                )
            ) : (
                <div className={styles.loader}>Video unavailable</div>
            )}
        </div>
    );
};