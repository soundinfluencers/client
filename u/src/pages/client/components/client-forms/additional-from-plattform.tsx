import { ButtonSecondary, FormInput, FormTextArea } from "@/components/ui";
import React from "react";
import plus from "@/assets/icons/plus.svg";

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

  return (
    <div className="additional-form">
      {data.contentTitle && (
        <div className="legend">
          <p className="labelForm">
            {data.contentTitle} {index + 1}{" "}
            {selectedEntity === 0 ? "(for Creators)" : "(for Communities)"}
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

            {input.id === "Contentlink*" && (
              <>
                {descriptions.map((descIndex) => (
                  <FormTextArea
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
