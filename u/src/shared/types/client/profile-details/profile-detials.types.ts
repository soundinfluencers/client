export interface ProfileBase {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ProfileClient extends ProfileBase {
  companyName: string;
}

export type Profile = ProfileClient;
