
import { getGroupBySocial } from "@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced";
type PricedAccount = { socialMedia: string; username?: string; publicPrice?: number; price?: number; prices?: { EUR?: number } };

export type PriceGroup = "main" | "music" | "press";
export type GroupPrices = Record<PriceGroup, number>;
export function calcGroupPrices(accounts: PricedAccount[]): {
  groupPrices: GroupPrices;
  totalPublicPrice: number;
} {
  const groupPrices: GroupPrices = { main: 0, music: 0, press: 0 };

  for (const a of accounts ?? []) {
    const social = String(a.socialMedia ?? "").toLowerCase();
    const group = getGroupBySocial(social);
    const price = Number(
        a.publicPrice ??
        a.price ??
        a.prices?.EUR ??
        0,
    );

    console.log({
      username: a.username,
      social,
      group,
      price,
    });

    groupPrices[group] += Number.isFinite(price) ? price : 0;
  }

  const totalPublicPrice =
    groupPrices.main + groupPrices.music + groupPrices.press;

  return { groupPrices, totalPublicPrice };
}
