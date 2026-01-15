// AdditionalPlatformForm.tsx
import { FormInput, FormTextArea } from "@/components/ui";
import React from "react";

interface AdditionalPlatformFormProps {
  data: any;
  index: number;
}

export const AdditionalPlatformForm: React.FC<AdditionalPlatformFormProps> = ({
  data,
  index,
}) => {
  console.log();
  return (
    <div className="additional-form">
      {data.contentTitle && (
        <p className="labelForm">
          {data.contentTitle} {index + 2}
        </p>
      )}
      <div className="inputs">
        {data.inputs &&
          data.inputs.map((input, i) => (
            <FormInput
              key={i}
              id={`${input.id}-${index + 2}`}
              name={`${input.name}-${index + 2}`}
              placeholder={input.placeholder}
              className="form-input"
              label={`${input.name}-${index + 2}`}
            />
          ))}
        {data.textAreas &&
          data.textAreas.map((textarea, i) => (
            <FormTextArea
              id={`${textarea.id}-${index + 2}`}
              key={i}
              name={`${textarea.name}-${index + 2}`}
              placeholder={textarea.placeholder}
              label={`${textarea.name}-${index + 2}`}
              className="form-textarea"
            />
          ))}
      </div>
      <hr style={{ margin: "20px 0" }} />
    </div>
  );
};
