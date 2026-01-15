export interface IDetailsInput {
  name: string;
  label: string;
  placeholder: string;
}

export interface ITextInput extends IDetailsInput {
  type: "text";
}
export interface INumberInput extends IDetailsInput {
  type: "number";
}
export interface IFileInput extends IDetailsInput {
  type: "file";
  size: "small";
}

export type TDetailsInputs =
  | ITextInput
  | INumberInput
  | IFileInput;
