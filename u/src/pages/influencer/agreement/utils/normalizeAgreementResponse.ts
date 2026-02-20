import type { TSocialAccounts } from "@/types/user/influencer.types.ts";
import type { IAgreement, TAgreementResponse } from "@/pages/influencer/agreement/types/agreement.types.ts";

export function normalizeAgreementResponse(data: TAgreementResponse | null): IAgreement[] {
  return Object.entries(data ?? []).flatMap(([socialMedia, accounts]) =>
    accounts.map((acc) => ({
      socialMedia: socialMedia as TSocialAccounts,
      username: acc.username,
      price: acc.price,
    }))
  );
}