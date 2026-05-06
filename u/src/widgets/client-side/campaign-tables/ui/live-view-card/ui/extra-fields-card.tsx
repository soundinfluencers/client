import React from "react";
import styles from "./live-view-card.module.scss";

type Props = {
    canEdit: boolean;
    mergedItem: any;
    showStoryTag: boolean;
    showStoryLink: boolean;
    onChangeField?: (
        field: "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;
};

export const ExtraFieldsCard: React.FC<Props> = ({
                                                     canEdit,
                                                     mergedItem,
                                                     showStoryTag,
                                                     showStoryLink,
                                                     onChangeField,
                                                 }) => {
    return (
        <>
            {showStoryTag && (
                <div className={styles.section}>
                    <h3>Story Tag</h3>
                    <div className={styles.fillInput}>
                        {canEdit ? (
                            <input
                                value={mergedItem?.taggedUser ?? ""}
                                onChange={(e) =>
                                    onChangeField?.("taggedUser", e.target.value)
                                }
                                placeholder="Tagged user"
                            />
                        ) : (
                            <p>{mergedItem?.taggedUser || "—"}</p>
                        )}
                    </div>
                </div>
            )}

            {showStoryLink && (
                <div className={styles.section}>
                    <h3>Story Link</h3>
                    <div className={styles.fillInput}>
                        {canEdit ? (
                            <input
                                value={mergedItem?.taggedLink ?? ""}
                                onChange={(e) =>
                                    onChangeField?.("taggedLink", e.target.value)
                                }
                                placeholder="Tagged link"
                            />
                        ) : (
                            <p>{mergedItem?.taggedLink || "—"}</p>
                        )}
                    </div>
                </div>
            )}


        </>
    );
};