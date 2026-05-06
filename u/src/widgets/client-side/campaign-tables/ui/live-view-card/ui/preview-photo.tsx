import React from "react";
import styles from "./live-view-card.module.scss";

import previewFallback from "@/assets/icons/video (2).png";
import play from "@/assets/icons/play.svg";
import {getFilePreview} from "@/entities/client-side/campaign-strategy-page/api/preview-file.ts";

type Props = {
    previewUrl?: string | null;
    pathLower?: string;
    fileId?: string;
    urlInsight?: string;
};

export const PreviewPhoto: React.FC<Props> = ({
                                                  previewUrl,
                                                  pathLower,
                                                  fileId,
                                                  urlInsight,
                                              }) => {
    const [url, setUrl] = React.useState<string | null>(previewUrl ?? null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        if (previewUrl) return;
        if (!pathLower || !fileId) return;

        let objectUrl = "";

        const loadPreview = async () => {
            try {
                setLoading(true);

                const blob = await getFilePreview({
                    provider: "dropbox",
                    pathLower,
                    fileId,
                    sizeTag: "w960h640",
                });

                objectUrl = URL.createObjectURL(blob);
                setUrl(objectUrl);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        void loadPreview();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [previewUrl, pathLower, fileId]);

    return (
        <div className={styles.video}>
            {url && !loading && !error && (
                <div className={styles.videoPlay}>
                    <div className={styles.videoPlayBtn}>
                        <img src={play} alt="" />
                    </div>
                </div>
            )}

            {loading ? (
                <div className={styles.loader}>Loading...</div>
            ) : url && !error ? (
                <img src={url} alt="preview" />
            ) : (
                <img src={urlInsight || previewFallback} alt="no preview" />
            )}
        </div>
    );
};