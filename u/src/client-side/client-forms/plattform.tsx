import React from "react";
import { FormInput, FormTextArea, ButtonSecondary } from "@/components";
import plus from "@/assets/icons/plus.svg";

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

  return (
    <>
      {data.contentTitle && selectedPlatforms.length >= 1 && (
        <div className="legend">
          <p className="labelForm">
            {data.contentTitle}{" "}
            {selectedEntity === 0 ? "(for Creators)" : "(for Communities)"}
          </p>
          {selectedPlatforms.map((sp) => (
            <img
              key={sp}
              src={getSocialMediaIcon(sp as SocialMediaType)}
              alt=""
            />
          ))}
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

            {input.id === "Contentlink*" && (
              <>
                {descriptions.map((descIndex) => (
                  <FormTextArea
                    required
                    key={descIndex}
                    id={`${formPrefix}-Postdescription-${descIndex + 1}`}
                    name={`${formPrefix}-Postdescription-${descIndex + 1}`}
                    label={`Post description ${descIndex + 1}`}
                    placeholder="Enter description"
                  />
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
