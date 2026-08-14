import assert from "node:assert/strict";
import test from "node:test";

import {
  decideProposalOverlapRemoval,
  getFullOfferBundleOverlap,
  removeFullOverlapAccounts,
  resolveOfferSocialAccountIds,
} from "../src/client-side/widgets/campaign/model/proposal-overlap-removal.ts";

const account = (
  socialAccountId: string,
  bundleId?: string,
  addedAccountsId = `added-${socialAccountId}`,
) => ({
  socialAccountId,
  addedAccountsId,
  ...(bundleId ? { bundleId } : {}),
});

const bundleAccounts = [
  account("A", "bundle-1"),
  account("B", "bundle-1"),
  account("C", "bundle-1"),
];

for (const selectedAccountIds of [
  ["A", "B", "C"],
  ["C", "A", "B"],
]) {
  test(`strict full overlap is order-independent: ${selectedAccountIds.join(",")}`, () => {
    const overlap = getFullOfferBundleOverlap({
      targetAccount: bundleAccounts[0],
      accounts: bundleAccounts,
      selectedOffer: { selectedAccountIds },
    });

    assert.deepEqual(new Set(overlap?.socialAccountIds), new Set(["A", "B", "C"]));
  });
}

for (const selectedAccountIds of [
  ["A", "B", "C", "D"],
  ["A", "B"],
  ["A", "B", "D"],
]) {
  test(`partial or different overlap is rejected: ${selectedAccountIds.join(",")}`, () => {
    assert.equal(
      getFullOfferBundleOverlap({
        targetAccount: bundleAccounts[0],
        accounts: bundleAccounts,
        selectedOffer: { selectedAccountIds },
      }),
      null,
    );
  });
}

test("persisted Offer lifecycle IDs resolve to socialAccountId business identities", () => {
  const resolved = resolveOfferSocialAccountIds({
    accounts: bundleAccounts,
    selectedOffer: {
      selectedAddedAccountsIds: ["added-C", "added-A", "added-B"],
    },
  });

  assert.deepEqual(resolved, new Set(["C", "A", "B"]));
});

test("conflicting Offer business and lifecycle namespaces fail closed", () => {
  const resolved = resolveOfferSocialAccountIds({
    accounts: bundleAccounts,
    selectedOffer: {
      selectedAccountIds: ["A", "B", "C"],
      selectedAddedAccountsIds: ["added-A", "added-B"],
    },
  });

  assert.equal(resolved, null);
});

test("full overlap removal keeps standalone topology and removes all package rows", () => {
  const accounts = [
    ...bundleAccounts,
    account("D"),
    account("E"),
  ];
  const decision = decideProposalOverlapRemoval({
    targetAccount: bundleAccounts[0],
    accounts,
    selectedOffer: { selectedAccountIds: ["A", "B", "C"] },
    optionIndexes: [0],
  });

  assert.equal(decision.kind, "remove_packages");
  if (decision.kind !== "remove_packages") return;

  assert.deepEqual(
    removeFullOverlapAccounts(accounts, decision.overlap).map(
      (row) => row.socialAccountId,
    ),
    ["D", "E"],
  );
});

test("full overlap-only topology delegates to option deletion when another option survives", () => {
  const decision = decideProposalOverlapRemoval({
    targetAccount: bundleAccounts[0],
    accounts: bundleAccounts,
    selectedOffer: { selectedAccountIds: ["A", "B", "C"] },
    optionIndexes: [0, 1],
  });

  assert.equal(decision.kind, "delete_option");
});

test("full overlap-only topology blocks deletion of the last Proposal option", () => {
  const before = structuredClone(bundleAccounts);
  const decision = decideProposalOverlapRemoval({
    targetAccount: bundleAccounts[0],
    accounts: bundleAccounts,
    selectedOffer: { selectedAccountIds: ["A", "B", "C"] },
    optionIndexes: [0],
  });

  assert.equal(decision.kind, "block_last_option");
  assert.deepEqual(bundleAccounts, before);
});

test("classification is side-effect free until the user confirms", () => {
  const accounts = [...bundleAccounts, account("D")];
  const before = structuredClone(accounts);

  decideProposalOverlapRemoval({
    targetAccount: bundleAccounts[0],
    accounts,
    selectedOffer: { selectedAccountIds: ["A", "B", "C"] },
    optionIndexes: [0],
  });

  assert.deepEqual(accounts, before);
});
