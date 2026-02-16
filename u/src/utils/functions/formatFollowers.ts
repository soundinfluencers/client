export function formatFollowers(count: number | string): string {
  const num = typeof count === "string" ? parseInt(count, 10) : count;

  if (isNaN(num)) return "0";

  if (num < 1000) {
    return num?.toString();
  } else if (num < 1_000_000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
}
