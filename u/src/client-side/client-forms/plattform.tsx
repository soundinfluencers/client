import React from "react";
import { FormInput, FormTextArea, ButtonSecondary } from "@/components";
import plus from "@/assets/icons/plus.svg";
import x from "@/assets/icons/x.svg";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";

interface PlatformFormProps {
  data: any;
  selectedPlatforms: string[];
  formPrefix: string;
  selectedEntity: number;
}

export function PlatformForm({
  data,
  selectedPlatforms,
  formPrefix,
  selectedEntity,
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
          {" "}
          {selectedPlatforms.map((sp) => (
            <img
              key={sp}
              src={getSocialMediaIcon(sp as SocialMediaType)}
              alt=""
            />
          ))}
          <p className="labelForm">
            {data.contentTitle}{" "}
            {/* {selectedEntity === 0 ? "(for Creators)" : "(for Communities)"} */}
          </p>
        </div>
      )}

      <div className="inputs">
        {data.inputs.map((input: any, index: number) => (
          <React.Fragment key={input.id}>
            <FormInput
              required
              id={`${formPrefix}-${input.id}-${index}`}
              name={`${formPrefix}-${input.name}-${index}`}
              label={input.name}
              placeholder={input.placeholder}
            />

            {input.id === "Contentlink" && (
              <>
                {descriptions.map((descIndex, i) => (
                  <div key={descIndex} style={{ position: "relative" }}>
                    <FormTextArea
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
                        }}>
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

        {data?.textAreas?.map((textarea, i) => (
          <FormTextArea
            required
            id={`${formPrefix}-${textarea.id}-${i}`}
            name={`${formPrefix}-${textarea.name}-${i}`}
            label={textarea.name}
            placeholder={textarea.placeholder}
          />
        ))}
      </div>
    </>
  );
}
