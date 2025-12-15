import type { IPlattformsDataFormProps } from "../../../types/form/plattforms-data-form.types";
import { FormInput } from "../../ui/inputs/form-input/form-attributes";
import {
  renderInputs,
  renderTextAreas,
} from "../renderFunctions/input-textAreas";

export function PlatformForm({
  data,
  register,
  errors,
}: {
  data: IPlattformsDataFormProps;
  register: any;
  errors: any;
}) {
  return (
    <>
      {data.headInput && (
        <FormInput
          label={data.headInput.name}
          name={data.headInput.name}
          placeholder={data.headInput.placeholder}
          register={register}
          required
          error={errors[data.headInput.name]}
        />
      )}
      {data.contentTitle && <p className="labelForm">{data.contentTitle}</p>}
      <div className="inputs">
        {renderInputs(data.inputs, register, errors)}
        {data.textAreas && renderTextAreas(data.textAreas, register, errors)}
      </div>
    </>
  );
}
