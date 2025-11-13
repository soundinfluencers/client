export type UserRoleType = 'client' | 'influencer';

export type ClientCompanyType =
    'Artist' |
    'Promoter' |
    'Pr Agent' |
    'Label' |
    'Other'

export const clientCompanyTypes: ClientCompanyType[] = [
    'Artist',
    'Promoter',
    'Pr Agent',
    'Label',
    'Other',
];

export interface Client {
    firstName: string,
    lastName: string,
    company: string,
    companyType: ClientCompanyType,
    instagramLink: string,
    email: string,
    referralCode?: string,
    phone?: string,
}