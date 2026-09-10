
type FormField = {
  id: string;
  name: string;
  placeholder: string;
};
export type PlatformConfig = {
  inputs?: FormField[];
  textAreas?: FormField[];
  contentTitle: string;
};

export interface IPlattformsDataForm {
  formType: "platform";
  headInput: FormField;
  musicPlatform: PlatformConfig;
  mainPlatform: PlatformConfig;
  pressPlatform: PlatformConfig;
}
export interface IPlattformsMapForms {
  main: PlatformConfig;
  music: PlatformConfig;
  press: PlatformConfig;
}
