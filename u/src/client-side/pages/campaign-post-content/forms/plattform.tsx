import React from "react";
import { FormInput, FormTextArea, ButtonSecondary } from "@/components";
import plus from "@/assets/icons/plus.svg";
import x from "@/assets/icons/x.svg";
import { getSocialMediaIconPostContent} from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import type {PlatformFormConfig} from "@/client-side/pages/campaign-post-content/model/platform.types.ts";
import {CampaignTextArea, CampaignTextInput} from "@components/form/input-post-content.tsx";

interface PlatformFormProps {
  data: PlatformFormConfig;
  selectedPlatforms: string[];
  formPrefix: string;
}

export function PlatformForm({
                               data,
                               selectedPlatforms,
                               formPrefix,
                             }: PlatformFormProps) {
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
      <>
        {data.contentTitle && selectedPlatforms.length >= 1 && (
            <div className="legend">
              {selectedPlatforms.map((platform) => (
                  <img
                      key={platform}
                      src={getSocialMediaIconPostContent(platform as SocialMediaType)}
                      alt=""
                  />
              ))}
              <p className="labelForm">{data.contentTitle}</p>
            </div>
        )}

        <div className="inputs">
          {data.inputs.map((input, index) => (
              <React.Fragment key={input.id}>
                <CampaignTextInput
                    required={!!input.required}
                    id={`${formPrefix}-${input.id}-${index}`}
                    name={`${formPrefix}-${input.name}-${index}`}
                    label={input.name}
                    placeholder={input.placeholder}
                />

                {input.id === "Contentlink" && (
                    <>
                      {descriptions.map((descIndex, i) => (
                          <div key={descIndex} style={{ position: "relative" }}>
                            <CampaignTextArea
                                required={true}
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

          {data.textAreas?.map((textarea, index) => (
              <CampaignTextArea
                  key={textarea.id}
                  required={!!textarea.required}
                  id={`${formPrefix}-${textarea.id}-${index}`}
                  name={`${formPrefix}-${textarea.name}-${index}`}
                  label={textarea.name}
                  placeholder={textarea.placeholder}
              />
          ))}
        </div>
      </>
  );
}