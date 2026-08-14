export const formatCompactNumber = (
  value: number,
  suffix?: string
) => {
  const abs = Math.abs(value);

  let floored = value;

  if (abs >= 1_000_000) {
    floored = Math.floor(value / 1_000_000) * 1_000_000;
  } else if (abs >= 1_000) {
    floored = Math.floor(value / 1_000) * 1_000;
  }

  const formatted = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(floored);

  return suffix ? `${formatted}${suffix}` : formatted;
};
