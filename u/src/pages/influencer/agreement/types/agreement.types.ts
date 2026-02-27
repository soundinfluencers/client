import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

export type TAgreementStats = "accept" | "decline" | "wait";

export type TAgreementType = "profileCreate" | "accountAdd";

export type TAgreementAccount = {
  username: string;
  price: number;
};

export type TAgreementAccountsMap = Partial<
  Record<TSocialAccounts, TAgreementAccount[]>
>;

export type TAgreementResponse = {
  agreementType: TAgreementType;
} & TAgreementAccountsMap;

export interface IAgreement {
  socialMedia: TSocialAccounts;
  username: string;
  price: number;
}

export type TNormalizedAgreement = {
  agreementType: TAgreementType;
  items: IAgreement[];
};
