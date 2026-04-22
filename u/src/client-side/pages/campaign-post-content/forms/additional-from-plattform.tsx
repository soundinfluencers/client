import React from "react";
import { ButtonSecondary } from "@/components";
import plus from "@/assets/icons/plus.svg";
import x from "@/assets/icons/x.svg";
import { getSocialMediaIconPostContent } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import type { PlatformFormConfig } from "@/client-side/pages/campaign-post-content/model/platform.types.ts";
import { CampaignTextArea, CampaignTextInput } from "@components/form/input-post-content.tsx";

type AdditionalPlatformFormData = PlatformFormConfig & {
    _id: string;
    platform: string;
    socialMedia: string;
};

interface AdditionalPlatformFormProps {
    data: AdditionalPlatformFormData;
    index: number;
    formPrefix: string;
    onRemove: () => void;
}

export const AdditionalPlatformForm: React.FC<AdditionalPlatformFormProps> = ({
                                                                                  data,
                                                                                  index,
                                                                                  formPrefix,
                                                                                  onRemove,
                                                                              }) => {
    const [descriptions, setDescriptions] = React.useState<number[]>([0]);

    const addDescription = () =>
        setDescriptions((prev) => [...prev, prev.length]);

    const removeDescription = (index: number) => {
        setDescriptions((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((_, i) => i !== index);
        });
    };

    return (
        <div className="additional-form">
            {data.contentTitle && (
                <div className="legend">
                    <img
                        key={data.socialMedia}
                        src={getSocialMediaIconPostContent(data.socialMedia as SocialMediaType) || ""}
                        alt=""
                    />
                    <p className="labelForm">
                        {data.contentTitle} {index + 1}
                    </p>

                    <button
                        type="button"
                        onClick={onRemove}
                        className="remove-additional-form"
                        aria-label="Remove additional form"
                        title="Remove"
                    >
                        <img src={x} alt="" />
                    </button>
                </div>
            )}

            <div className="inputs">
                {data.inputs?.map((input, inputIndex) => (
                    <React.Fragment key={input.id}>
                        <CampaignTextInput
                            required={!!input.required}
                            id={`${formPrefix}-${input.id}-${inputIndex}`}
                            name={`${formPrefix}-${input.name}-${inputIndex}`}
                            label={input.name}
                            placeholder={input.placeholder}
                        />

                        {input.id === "Contentlink" && (
                            <>
                                {descriptions.map((descIndex, i) => (
                                    <div key={descIndex} style={{ position: "relative" }}>
                                        <CampaignTextArea
                                            required
                                            id={`${formPrefix}-Postdescription-${i + 1}`}
                                            name={`${formPrefix}-Postdescription-${i + 1}`}
                                            label={`Post description ${i + 1}`}
                                            placeholder="Enter description"
                                        />

                                        {descriptions.length > 1 && i > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDescription(i)}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    right: 8,
                                                    background: "transparent",
                                                    border: "none",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <img
                                                    style={{ width: "20px", height: "20px" }}
                                                    src={x}
                                                    alt="remove"
                                                />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <ButtonSecondary
                                    children={<img src={plus} alt="" />}
                                    onClick={addDescription}
                                    className="add-description-btn"
                                    text="Add description"
                                />
                            </>
                        )}
                    </React.Fragment>
                ))}

                {data.textAreas?.map((textarea, textareaIndex) => (
                    <CampaignTextArea
                        key={textarea.id}
                        required={!!textarea.required}
                        id={`${formPrefix}-${textarea.id}-${textareaIndex}`}
                        name={`${formPrefix}-${textarea.name}-${textareaIndex}`}
                        label={textarea.name}
                        placeholder={textarea.placeholder}
                    />
                ))}
            </div>

            <hr style={{ margin: "20px 0" }} />
        </div>
    );
};