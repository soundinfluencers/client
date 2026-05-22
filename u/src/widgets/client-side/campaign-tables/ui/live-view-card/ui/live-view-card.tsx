import React from "react";
import { PreviewPhoto } from "./preview-photo";
import { VideoPreview } from "./video-preview";
import { ModalVideo } from "./modal-video";
import { LiveDescriptionsEditorDropdown } from "./live-descriptions-editor-dropdown";
import { ExtraFieldsCard } from "./extra-fields-card";

import styles from "./live-view-card.module.scss";
import {useEditableContentItem} from "@/widgets/client-side/campaign-tables/model/use-editable-content-item.ts";
import {getSocialMediaIconPostContent} from "@/constants/social-medias.ts";
import type {socialMediaType} from "@/pages/influencer/promos/types/promos.types.ts";

type NetworkItem = {
    addedAccountsId?: string;
    socialAccountId?: string;
    username?: string;
    logoUrl?: string;
    followers?: number;
};

type Props = {
    item: any;
    networks: NetworkItem[];
    canEdit?: boolean;

    onAddDescription?: (contentId: string, text: string) => void;
    onUpdateDescription?: (
        contentId: string,
        descriptionId: string,
        value: string,
    ) => void;
    onDeleteDescription?: (contentId: string, descriptionId: string) => void;

    onChangeField?: (
        contentId: string,
        field: "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;
};

const formatFollowers = (value?: number) => {
    if (!value) return "0";
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(value);
};

export const LiveViewCard: React.FC<Props> = ({
                                                  item,
                                                  networks,
                                                  canEdit = false,
                                                  onAddDescription,
                                                  onUpdateDescription,
                                                  onDeleteDescription,
                                                  onChangeField,
                                              }) => {
    const contentId = String(item?._id ?? "");
    const merged = useEditableContentItem(contentId, item);

    const isMusic = merged?.socialMediaGroup === "music";
    const isPress = merged?.socialMediaGroup === "press";

    const showStoryTag = !isMusic && !isPress;
    const showStoryLink = !isMusic;

    const [isVideoOpen, setIsVideoOpen] = React.useState(false);
    const [descOpen, setDescOpen] = React.useState(false);
    const [selectedDescIdx, setSelectedDescIdx] = React.useState(0);

    const media0 = merged?.mediaCache?.items?.[0];

    const pathLower = media0?.pathLower;

    const videoUrl = media0?.url ?? null;

// new logic later:
// const videoUrl =
//     media0?.url ??
//     merged?.mainLink ??
//     null;

    const hasVideo = Boolean(pathLower || videoUrl);

    React.useEffect(() => {
        setSelectedDescIdx(0);
    }, [contentId]);

    React.useEffect(() => {
        const descriptions = merged?.descriptions ?? [];

        if (!descriptions.length) {
            setSelectedDescIdx(0);
            return;
        }

        setSelectedDescIdx((prev) =>
            prev > descriptions.length - 1 ? descriptions.length - 1 : prev,
        );
    }, [merged?.descriptions]);

    const titleByGroup = (group: string) => {
        if (group === "music") return "Track title";
        if (group === "press") return "Artwork link";
        return "Post description";
    };

    const title = titleByGroup(String(merged?.socialMediaGroup ?? ""));

    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <div className={styles.videoWrap}>
                    <div
                        role={hasVideo ? "button" : undefined}
                        className={styles.previewTrigger}
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

                {/* new video logic later:
                    <div className={styles.videoWrap}>
                        <div
                            role={hasVideo ? "button" : undefined}
                            className={styles.previewTrigger}
                            onClick={() => {
                                if (!hasVideo) return;
                                setIsVideoOpen(true);
                            }}
                        >
                            <PreviewPhoto
                                previewUrl={media0?.previewUrl}
                                pathLower={media0?.pathLower}
                                fileId={media0?.fileId}
                                urlInsight={videoUrl ?? undefined}
                            />
                        </div>
                    </div>
                    */}

                <LiveDescriptionsEditorDropdown
                    title={title}
                    canEdit={canEdit}
                    descriptions={merged?.descriptions ?? []}
                    isOpen={descOpen}
                    onOpenChange={setDescOpen}
                    selectedIdx={selectedDescIdx}
                    setSelectedIdx={setSelectedDescIdx}
                    onAdd={(text) => onAddDescription?.(contentId, text)}
                    onUpdate={(descriptionId, value) =>
                        onUpdateDescription?.(contentId, descriptionId, value)
                    }
                    onDelete={(descriptionId) =>
                        onDeleteDescription?.(contentId, descriptionId)
                    }
                />

                <ExtraFieldsCard
                    canEdit={canEdit}
                    mergedItem={merged}
                    showStoryTag={showStoryTag}
                    showStoryLink={showStoryLink}
                    onChangeField={(field, value) =>
                        onChangeField?.(contentId, field, value)
                    }
                />

                <div className={styles.section}>
                    <h3>Audience reach</h3>
                    <div className={styles.audienceList}>
                        <div className={styles.audienceItem}>
                            <img src={getSocialMediaIconPostContent(merged?.socialMedia as socialMediaType)  || ""} alt=""/>
                            <p>{merged?.socialMedia || "—"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h3>Networks</h3>
                <div className={styles.networks}>
                    {networks.map((net) => (
                        <div
                            className={styles.networkRow}
                            key={
                                net.addedAccountsId ??
                                net.socialAccountId ??
                                net.username
                            }
                        >
                            <div className={styles.networkLogo}>
                                {net.logoUrl ? (
                                    <img src={net.logoUrl} alt="logo" />
                                ) : (
                                    <div className={styles.logoStub} />
                                )}
                                <p>{formatFollowers(net.followers)}</p>
                            </div>
                            <p>{net.username || "—"}</p>
                        </div>
                    ))}
                </div>
            </div>

            {isVideoOpen && (
                <ModalVideo onClose={() => setIsVideoOpen(false)}>
                    <VideoPreview videoUrl={videoUrl} pathLower={pathLower} />
                </ModalVideo>
            )}
        </div>
    );
};