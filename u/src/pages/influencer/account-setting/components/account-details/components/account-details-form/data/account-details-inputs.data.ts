import type { TDetailsInputs } from "../types/account-details-inputs.types";

export const ACCOUNT_DETAILS_INPUTS_DATA: TDetailsInputs[] = [
  {
    type: "text",
    name: "firstName",
    label: "First Name",
    placeholder: "Enter first name",
  },
  {
    type: "text",
    name: "lastName",
    label: "Last Name",
    placeholder: "Enter last name",
  },
  // {
  //   type: "file",
  //   name: "profilePhotoUrl",
  //   label: "Photo profile",
  //   placeholder: "Attach the logo for your brand here",
  //   size: "small",
  // },
  {
    type: "text",
    name: "email",
    label: "Email",
    placeholder: "Enter email",
  },
  {
    type: "text",
    name: "phone",
    label: "Phone number",
    placeholder: "Enter phone number",
  },
  // {
  //   type: 'text',
  //   name: 'telegramUsername',
  //   label: 'Telegram',
  //   placeholder: 'Enter telegram username',
  // }
];