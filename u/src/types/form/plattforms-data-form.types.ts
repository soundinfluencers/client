type inputs = {
  name: string;
  placeholder: string;
};
type textAreas = {
  name: string;
  placeholder: string;
};

export interface PlattformsDataFormProps {
  formType: "platform";
  plattform: string;
  headInput: inputs;
  inputs: inputs[];
  textAreas?: textAreas[];
  contentTitle: string;
}
