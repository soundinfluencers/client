// export function formatFollowers(count: number | string): string {
//   const num = typeof count === "string" ? parseInt(count, 10) : count;
//
//   if (isNaN(num)) return "0";
//
//   if (num < 1000) {
//     return num?.toString();
//   } else if (num < 1_000_000) {
//     return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
//   } else {
//     return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
//   }
// }
export const formatFollowers = (
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