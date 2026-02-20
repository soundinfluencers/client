import { ButtonSecondary, FormInput, FormTextArea } from "@/components/ui";
import React from "react";
import plus from "@/assets/icons/plus.svg";
import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import x from "@/assets/icons/x.svg";

interface AdditionalPlatformFormProps {
  data: any;
  index: number;
  selectedEntity: number;
  formPrefix: string;
}

export const AdditionalPlatformForm: React.FC<AdditionalPlatformFormProps> = ({
  data,
  index,
  formPrefix,
  selectedEntity,
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
          {" "}
          <img
            key={data.socialMedia}
            src={getSocialMediaIcon(data.socialMedia as SocialMediaType)}
            alt=""
          />
          <p className="labelForm">
            {data.contentTitle} {index + 1}{" "}
            {/* {selectedEntity === 0 ? "(for Creators)" : "(for Communities)"} */}
          </p>
        </div>
      )}

      <div className="inputs">
        {data.inputs?.map((input, i) => (
          <React.Fragment key={i}>
            <FormInput
              id={`${formPrefix}-${input.id}-${i}`}
              name={`${formPrefix}-${input.name}-${i}`}
              placeholder={input.placeholder}
              label={input.name}
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

        {data.textAreas?.map((textarea, i) => (
          <FormTextArea
            id={`${formPrefix}-${textarea.id}-${i}`}
            key={i}
            name={`${formPrefix}-${textarea.name}-${i}`}
            placeholder={textarea.placeholder}
            label={textarea.name}
          />
        ))}
      </div>

      <hr style={{ margin: "20px 0" }} />
    </div>
  );
};
