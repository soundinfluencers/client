export interface IPersonalDetailsInput {
  name: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'email' | 'tel' | 'password';
}

export const PERSONAL_DETAILS_INPUTS: IPersonalDetailsInput[] = [
  {
    name: 'firstName',
    label: 'First name*',
    placeholder: 'Enter first name',
    type: 'text',
  },
  {
    name: 'lastName',
    label: 'Last name*',
    placeholder: 'Enter last name',
    type: 'text',
  },
  {
    name: 'email',
    label: 'Email*',
    placeholder: 'Enter email',
    type: 'email',
  },
  {
    name: 'phone',
    label: 'Phone number*',
    type: 'tel',
  },
  {
    name: 'password',
    label: 'Password*',
    placeholder: 'Enter password',
    type: 'password',
  },
];