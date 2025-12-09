export interface BespokeField {
  label: string;
  name: string;
  placeholder: string;
}
type textAreas = {
  name: string;
  placeholder: string;
};

export interface BespokeCampaignTabData {
  formType: "bespoke";
  promoType: string;
  title: string;
  inputs: BespokeField[];
  textAreas?: textAreas[];
}
