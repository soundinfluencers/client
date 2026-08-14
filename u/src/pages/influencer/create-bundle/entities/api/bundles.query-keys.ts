export const bundleAccountsQueryKeys = {
  all: ["bundle-accounts"] as const,
  accounts: () => [...bundleAccountsQueryKeys.all, "accounts"] as const,
}
