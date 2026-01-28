const norm = (v: unknown) =>
  typeof v === "string" ? v.trim().toLowerCase() : "";

export function getPlatformItems(items: any[], socialMedia?: string) {
  const rowPlatform = norm(socialMedia);
  return (items ?? []).filter((it) => norm(it?.socialMedia) === rowPlatform);
}
