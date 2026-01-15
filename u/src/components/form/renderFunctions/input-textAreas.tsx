import {
  FormInput,
  FormTextArea,
} from "../../ui/inputs/form-input/form-attributes";

export function renderInputs(inputs: any) {
  return inputs.map((input: any) => (
    <FormInput
      id={input.id}
      key={input.name}
      label={input.name}
      name={input.name}
      placeholder={input.placeholder}
    />
  ));
}
export function renderTextAreas(textAreas: any[], isBespoke = false) {
  return textAreas.map((textArea) => (
    <FormTextArea
      id={textArea.id}
      key={textArea.name}
      name={textArea.name}
      label={textArea.name}
      placeholder={textArea.placeholder}
      isBespoke={isBespoke}
    />
  ));
}
