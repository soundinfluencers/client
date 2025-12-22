import type { IPlattformsDataFormProps } from "../../../types/form/plattforms-data-form.types";
import { FormInput } from "../../ui/inputs/form-input/form-attributes";
import {
  renderInputs,
  renderTextAreas,
} from "../renderFunctions/input-textAreas";

export function PlatformForm({ data }: { data: IPlattformsDataFormProps }) {
  return (
    <>
      {data.headInput && (
        <FormInput
          label={data.headInput.name}
          name={data.headInput.name}
          placeholder={data.headInput.placeholder}
          required
        />
      )}
      {data.contentTitle && <p className="labelForm">{data.contentTitle}</p>}
      <div className="inputs">
        {renderInputs(data.inputs)}
        {data.textAreas && renderTextAreas(data.textAreas)}
      </div>
    </>
  );
}
