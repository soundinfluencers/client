import type { TSocialAccounts } from "@/types/user/influencer.types.ts";
import type {
  IAgreement, TAgreementAccount,
  TAgreementAccountsMap,
  TAgreementResponse, TNormalizedAgreement,
} from "@/pages/influencer/agreement/types/agreement.types.ts";

export function normalizeAgreementAccounts(
  accountsBySocial: TAgreementAccountsMap | null | undefined
): IAgreement[] {
  if (!accountsBySocial) return [];

  return (Object.entries(accountsBySocial) as Array<
    [TSocialAccounts, TAgreementAccount[] | undefined]
  >).flatMap(([socialMedia, accounts]) =>
    (accounts ?? []).map((acc) => ({
      socialMedia,
      username: acc.username,
      price: acc.price,
    }))
  );
}

export function normalizeAgreementResponse(
  data: TAgreementResponse | null | undefined
): TNormalizedAgreement | null {
  if (!data) return null;

  const { agreementType, ...accountsBySocial } = data;
  return {
    agreementType,
    items: normalizeAgreementAccounts(accountsBySocial),
  };
}
