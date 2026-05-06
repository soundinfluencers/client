import React from "react";
import styles from "./campaign-post-content-block.module.scss";
import plus from "@/assets/icons/plus.svg";
import x from "@/assets/icons/x.svg";
import type {
    CampaignPostContentAccount,
    CampaignPostContentBlock,
} from "../model/campaign-post-content.types";
import {
    getAccountsForBlock,
    normalizeSocial,
} from "@/widgets/client-side/campaign-post-content/model/campaign-post-content.helpers.ts";
import { getSocialMediaIconPostContent } from "@/constants/social-medias.ts";
import type { SocialMediaType } from "@/shared/types/utils/constants.types.ts";

type Props = {
    block: CampaignPostContentBlock;
    accounts: CampaignPostContentAccount[];
    title: string;
    errors?: any;
    onChangeField: (
        blockId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;
    onAddDescription: (blockId: string) => void;
    onRemoveDescription: (blockId: string, descriptionId: string) => void;
    onChangeDescription: (
        blockId: string,
        descriptionId: string,
        value: string,
    ) => void;
    onRemoveBlock: (blockId: string) => void;
};

export const CampaignPostContentBlockView: React.FC<Props> = ({
                                                                  block,
                                                                  accounts,
                                                                  title,
                                                                  errors,
                                                                  onChangeField,
                                                                  onAddDescription,
                                                                  onRemoveDescription,
                                                                  onChangeDescription,
                                                                  onRemoveBlock,
                                                              }) => {
    const isMain = block.group === "main";
    const isMusic = block.group === "music";
    const isPress = block.group === "press";

    const fieldsErrors = errors?.fields;

    const blockAccounts = React.useMemo(
        () => getAccountsForBlock(block, accounts),
        [block, accounts],
    );

    const uniquePlatforms = Array.from(
        new Set(blockAccounts.map((item) => normalizeSocial(item.socialMedia))),
    );

    return (
        <div className={styles.block}>
            <div className={styles.legend}>
                <div className={styles.legendInfo}>
                    {!!uniquePlatforms.length && (
                        <div className={styles.platformsRow}>
                            {uniquePlatforms.map((platform) => (
                                <img
                                    key={platform}
                                    src={
                                        getSocialMediaIconPostContent(
                                            platform as SocialMediaType,
                                        ) || ""
                                    }
                                    alt={platform}
                                />
                            ))}
                        </div>
                    )}

                    <p className={styles.labelForm}>{title}</p>
                </div>

                {block.isRemovable && (
                    <button type="button" onClick={() => onRemoveBlock(block.id)}>
                        <img src={x} alt="" />
                    </button>
                )}
            </div>

            <div className={styles.inputs}>
                <div className={styles.formInput}>
                    <label>Content link</label>

                    <input
                        value={block.fields.mainLink}
                        onChange={(e) =>
                            onChangeField(
                                block.id,
                                "mainLink",
                                e.target.value,
                            )
                        }
                        placeholder={
                            isMusic
                                ? "https://"
                                : isPress
                                    ? "Link to music, events, news"
                                    : "https://"
                        }
                        className={
                            fieldsErrors?.mainLink ? styles.inputError : ""
                        }
                    />

                    {fieldsErrors?.mainLink?.message && (
                        <p className={styles.errorText}>
                            {fieldsErrors.mainLink.message as string}
                        </p>
                    )}
                </div>

                {block.fields.descriptions.map((description, index) => {
                    const descriptionError =
                        fieldsErrors?.descriptions?.[index]?.value;

                    return (
                        <div
                            key={description.id}
                            className={styles.formFieldWrap}
                        >
                            <div className={styles.formField}>
                                <div className={styles.formField__legend}>
                                    <label>
                                        {isMusic
                                            ? "Track title"
                                            : "Post description brief"}{" "}
                                        {index + 1}
                                    </label>

                                    {block.fields.descriptions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onRemoveDescription(
                                                    block.id,
                                                    description.id,
                                                )
                                            }
                                        >
                                            <img src={x} alt="" />
                                        </button>
                                    )}
                                </div>

                                <textarea
                                    value={description.value}
                                    onChange={(e) =>
                                        onChangeDescription(
                                            block.id,
                                            description.id,
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter post description brief"
                                    className={
                                        descriptionError
                                            ? styles.inputError
                                            : ""
                                    }
                                />

                                {descriptionError?.message && (
                                    <p className={styles.errorText}>
                                        {descriptionError.message as string}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {!isPress && (
                    <button
                        type="button"
                        className={styles.addDescriptionButton}
                        onClick={() => onAddDescription(block.id)}
                    >
                        <img src={plus} alt="" /> Add description
                    </button>
                )}

                {isMain && (
                    <>
                        <div className={styles.formInput}>
                            <label>Story tag</label>

                            <input
                                value={block.fields.taggedUser}
                                onChange={(e) =>
                                    onChangeField(
                                        block.id,
                                        "taggedUser",
                                        e.target.value,
                                    )
                                }
                                placeholder="Enter story tag"
                                className={
                                    fieldsErrors?.taggedUser
                                        ? styles.inputError
                                        : ""
                                }
                            />

                            {fieldsErrors?.taggedUser?.message && (
                                <p className={styles.errorText}>
                                    {fieldsErrors.taggedUser.message as string}
                                </p>
                            )}
                        </div>

                        <div className={styles.formInput}>
                            <label>Story link</label>

                            <input
                                value={block.fields.taggedLink}
                                onChange={(e) =>
                                    onChangeField(
                                        block.id,
                                        "taggedLink",
                                        e.target.value,
                                    )
                                }
                                placeholder="https://"
                                className={
                                    fieldsErrors?.taggedLink
                                        ? styles.inputError
                                        : ""
                                }
                            />

                            {fieldsErrors?.taggedLink?.message && (
                                <p className={styles.errorText}>
                                    {fieldsErrors.taggedLink.message as string}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {isPress && (
                    <div className={styles.formInput}>
                        <label>Link to press release</label>

                        <input
                            value={block.fields.taggedLink}
                            onChange={(e) =>
                                onChangeField(
                                    block.id,
                                    "taggedLink",
                                    e.target.value,
                                )
                            }
                            placeholder="https://"
                            className={
                                fieldsErrors?.taggedLink
                                    ? styles.inputError
                                    : ""
                            }
                        />

                        {fieldsErrors?.taggedLink?.message && (
                            <p className={styles.errorText}>
                                {fieldsErrors.taggedLink.message as string}
                            </p>
                        )}
                    </div>
                )}

                <div className={styles.formField}>
                    <label>Additional brief</label>

                    <textarea
                        value={block.fields.additionalBrief}
                        onChange={(e) =>
                            onChangeField(
                                block.id,
                                "additionalBrief",
                                e.target.value,
                            )
                        }
                        placeholder="Enter additional brief"
                    />
                </div>
            </div>
        </div>
    );
};