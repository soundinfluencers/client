import type { CampaignAddedAccount } from "@/types/store/index.types";
import { getGroupBySocial } from "@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced";

export type PriceGroup = "main" | "music" | "press";
export type GroupPrices = Record<PriceGroup, number>;
export function calcGroupPrices(accounts: CampaignAddedAccount[]): {
  groupPrices: GroupPrices;
  totalPublicPrice: number;
} {
  const groupPrices: GroupPrices = { main: 0, music: 0, press: 0 };

  for (const a of accounts ?? []) {
    const group = getGroupBySocial(
      String((a as any).socialMedia ?? "").toLowerCase(),
    ) as PriceGroup;

    const price = Number((a as any).publicPrice ?? (a as any).prices?.EUR ?? 0);

    groupPrices[group] += Number.isFinite(price) ? price : 0;
  }

  const totalPublicPrice =
    groupPrices.main + groupPrices.music + groupPrices.press;

  return { groupPrices, totalPublicPrice };
}
