import type {
  IPlattformsDataForm,
  PlatformConfig,
} from "@/types/client/form-clients/plattforms-data-form.types";
import {
  renderInputs,
  renderTextAreas,
} from "../../../../components/form/renderFunctions/input-textAreas";
import { ButtonSecondary, FormInput, FormTextArea } from "@/components";
import plus from "@/assets/icons/plus.svg";
import React from "react";

export function PlatformForm({ data }: { data: any }) {
  console.log(data, "input");
  const [descriptions, setDescriptions] = React.useState<number[]>([0]);
  const addDescription = () => {
    setDescriptions((prev) => [...prev, prev.length]);
  };
  return (
    <>
      {data.contentTitle && <p className="labelForm">{data.contentTitle}</p>}

      <div className="inputs">
        {data.inputs.map((input: any, index: number) => (
          <React.Fragment key={input.id}>
            <FormInput
              id={input.id}
              label={input.name}
              name={input.name}
              placeholder={input.placeholder}
            />

            {input.id === "Contentlink*" && (
              <>
                {descriptions.map((index) => (
                  <FormTextArea
                    key={index}
                    id={`Postdescription-${index + 1}`}
                    name={`Postdescription-${index + 1}`}
                    label={`Post description ${index + 1}`}
                    placeholder="Enter description"
                  />
                ))}

                <ButtonSecondary
                  children={<img src={plus} alt="" />}
                  onClick={addDescription}
                  className="add-description-btn"
                  text={"Add description"}
                />
              </>
            )}
          </React.Fragment>
        ))}

        {data.textAreas && renderTextAreas(data.textAreas)}
      </div>
    </>
  );
}
