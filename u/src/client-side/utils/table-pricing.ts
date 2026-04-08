
import { getGroupBySocial } from "@/client-side/widgets/add-influencer-build-campaign/add-to-proposal/bc-prooced";
import type {ConnectedAccount} from "@/client-side/types/offers.ts";

export type PriceGroup = "main" | "music" | "press";
export type GroupPrices = Record<PriceGroup, number>;
export function calcGroupPrices(accounts: ConnectedAccount[]): {
  groupPrices: GroupPrices;
  totalPublicPrice: number;
} {
  const groupPrices: GroupPrices = { main: 0, music: 0, press: 0 };

  for (const a of accounts ?? []) {
    const social = String((a as any).socialMedia ?? "").toLowerCase();
    const group = getGroupBySocial(social);
    const price = Number(
        (a as any).publicPrice ??
        (a as any).price ??
        (a as any).prices?.EUR ??
        0,
    );

    console.log({
      username: (a as any).username,
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
