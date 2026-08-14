const compactFollowersFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const rewardNumberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
  useGrouping: false,
});

export const formatFollowers = (followers: number): string =>
  Number.isFinite(followers) ? compactFollowersFormatter.format(followers) : "";

export const formatReward = (reward: number, currency: string): string => {
  if (!Number.isFinite(reward)) {
    return "";
  }

  const formattedReward = rewardNumberFormatter.format(reward);

  try {
    const currencyPart = new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find(({ type }) => type === "currency")?.value;

    return currencyPart
      ? `${formattedReward}${currencyPart}`
      : `${formattedReward} ${currency}`;
  } catch {
    return currency ? `${formattedReward} ${currency}` : formattedReward;
  }
};
