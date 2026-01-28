import type { TSocialAccounts } from "@/types/user/influencer.types";

export interface IAccountUserInput {
  name: string;
  label: string;
  placeholder: string;
}

export interface ITextInput extends IAccountUserInput {
  type: "text";
};
export interface INumberInput extends IAccountUserInput {
  type: "number";
};
export interface IFileInput extends IAccountUserInput {
  type: "file";
  size: "small";
};

export type TAccountUserInputs =
  | ITextInput
  | INumberInput
  | IFileInput;

export interface IAccountUserInputsConfig {
  inputs: TAccountUserInputs[];
}

export type TAccountUserInputsData = Record<
  TSocialAccounts,
  IAccountUserInputsConfig
>;