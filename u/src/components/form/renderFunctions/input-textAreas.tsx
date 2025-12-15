import {
  FormInput,
  FormTextArea,
} from "../../ui/inputs/form-input/form-attributes";

export function renderInputs(inputs: any[], register: any, errors: any) {
  return inputs.map((input) => (
    <FormInput
      key={input.name}
      label={input.name}
      name={input.name}
      placeholder={input.placeholder}
      register={register}
      error={errors[input.name]}
    />
  ));
}
export function renderTextAreas(
  textAreas: any[],
  register: any,
  errors: any,
  isBespoke = false
) {
  return textAreas.map((textArea) => (
    <FormTextArea
      key={textArea.name}
      name={textArea.name}
      label={textArea.name}
      placeholder={textArea.placeholder}
      register={register}
      error={errors[textArea.name]}
      isBespoke={isBespoke}
    />
  ));
}
