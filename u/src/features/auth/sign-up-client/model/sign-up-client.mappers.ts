import type { TSignUpClientFormValues } from "@/features/auth/sign-up-client/model/sign-up-client-form.schema.ts";


export const getInitialPersonalDetails = (): TSignUpClientFormValues => {
  return {
    firstName: "",
    lastName: "",
    company: "",
    companyType: "",
    instagramUsername: "",
    email: "",
    phone: "+44",
    referralCode: "",
    password: "",
  }
};

export const mapSignupClientToDto = (data: any): any => {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    company: data.company,
    companyType: data.companyType,
    instagramUsername: data.instagramUsername,
    email: data.email,
    phone: data.phone,
    referalCode: data.referralCode,
    password: data.password,
  }
};
