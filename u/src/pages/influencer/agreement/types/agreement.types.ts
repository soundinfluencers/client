import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

export type TAgreementStats = 'accept' | 'decline' | 'wait';

export type TAgreementAccount = {
  username: string;
  price: number;
};

export type TAgreementResponse = Record<TSocialAccounts, TAgreementAccount[]>;

export interface IAgreement {
  socialMedia: TSocialAccounts;
  username: string;
  price: number;
}