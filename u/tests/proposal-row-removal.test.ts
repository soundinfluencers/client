import assert from "node:assert/strict";
import test from "node:test";

import {
  decideProposalRowRemoval,
  executeProposalRowRemovalDecision,
} from "../src/client-side/widgets/campaign/model/proposal-row-removal.ts";

const account = (
  socialAccountId: string,
  bundleId?: string,
  addedAccountsId = `added-${socialAccountId}`,
) => ({
  socialAccountId,
  addedAccountsId,
  ...(bundleId ? { bundleId } : {}),
});

const decide = ({
  targetAccount,
  accounts,
  selectedAccountIds = [],
  optionIndexes = [0, 1],
}: {
  targetAccount: ReturnType<typeof account>;
  accounts: ReturnType<typeof account>[];
  selectedAccountIds?: string[];
  optionIndexes?: number[];
}) =>
  decideProposalRowRemoval({
    targetAccount,
    accounts,
    selectedOffer: selectedAccountIds.length ? { selectedAccountIds } : null,
    optionIndexes,
  });

test("standalone-only option delegates to option deletion when another option survives", () => {
  const standalone = account("A");

  assert.equal(
    decide({ targetAccount: standalone, accounts: [standalone] }).kind,
    "delete_option",
  );
});

test("Offer-only physical rows are one logical removable topology", () => {
  const accounts = [account("A"), account("B"), account("C")];
  const decision = decide({
    targetAccount: accounts[1],
    accounts,
    selectedAccountIds: ["A", "B", "C"],
  });

  assert.equal(decision.kind, "delete_option");
  assert.equal(
    decision.kind === "not_removable" ? null : decision.removalKind,
    "offer",
  );
});

test("Bundle-only physical rows are one logical removable topology", () => {
  const accounts = [account("A", "bundle-1"), account("B", "bundle-1")];
  const decision = decide({ targetAccount: accounts[0], accounts });

  assert.equal(decision.kind, "delete_option");
  assert.equal(
    decision.kind === "not_removable" ? null : decision.removalKind,
    "bundle",
  );
});

for (const fixture of [
  {
    name: "standalone",
    accounts: [account("A")],
    selectedAccountIds: [] as string[],
  },
  {
    name: "Offer",
    accounts: [account("A"), account("B")],
    selectedAccountIds: ["A", "B"],
  },
  {
    name: "Bundle",
    accounts: [account("A", "bundle-1"), account("B", "bundle-1")],
    selectedAccountIds: [] as string[],
  },
]) {
  test(`${fixture.name}-only last option is blocked`, () => {
    assert.equal(
      decide({
        targetAccount: fixture.accounts[0],
        accounts: fixture.accounts,
        selectedAccountIds: fixture.selectedAccountIds,
        optionIndexes: [0],
      }).kind,
      "block_last_option",
    );
  });
}

test("removing an Offer keeps a standalone topology", () => {
  const accounts = [account("A"), account("B"), account("D")];
  const decision = decide({
    targetAccount: accounts[0],
    accounts,
    selectedAccountIds: ["A", "B"],
  });

  assert.equal(decision.kind, "keep_option");
  assert.equal(
    decision.kind === "keep_option" ? decision.remainingAccountsCount : null,
    1,
  );
});

test("removing standalone alongside an Offer keeps the Offer topology", () => {
  const accounts = [account("A"), account("B"), account("D")];

  assert.equal(
    decide({
      targetAccount: accounts[2],
      accounts,
      selectedAccountIds: ["A", "B"],
    }).kind,
    "keep_option",
  );
});

test("removing a Bundle keeps standalone topology", () => {
  const accounts = [
    account("A", "bundle-1"),
    account("B", "bundle-1"),
    account("D"),
  ];

  assert.equal(
    decide({ targetAccount: accounts[0], accounts }).kind,
    "keep_option",
  );
});

test("removing standalone alongside a Bundle keeps the Bundle topology", () => {
  const accounts = [
    account("A", "bundle-1"),
    account("B", "bundle-1"),
    account("D"),
  ];

  assert.equal(
    decide({ targetAccount: accounts[2], accounts }).kind,
    "keep_option",
  );
});

test("partial Offer/Bundle overlap keeps the other package for either removal", () => {
  const accounts = [
    account("A"),
    account("B"),
    account("C", "bundle-1"),
    account("D", "bundle-1"),
    account("E", "bundle-1"),
  ];
  const selectedAccountIds = ["A", "B", "C", "D"];

  assert.equal(
    decide({
      targetAccount: accounts[0],
      accounts,
      selectedAccountIds,
    }).kind,
    "keep_option",
  );
  assert.equal(
    decide({
      targetAccount: accounts[4],
      accounts,
      selectedAccountIds,
    }).kind,
    "keep_option",
  );
});

test("delete-option execution calls Stage 5A once and does not mutate topology", async () => {
  const standalone = account("A");
  const decision = decide({ targetAccount: standalone, accounts: [standalone] });
  let topologyMutations = 0;
  let optionDeletes = 0;
  let blocks = 0;

  await executeProposalRowRemovalDecision(decision, {
    onKeepOption: () => {
      topologyMutations += 1;
    },
    onDeleteOption: async () => {
      optionDeletes += 1;
    },
    onBlockLastOption: () => {
      blocks += 1;
    },
  });

  assert.deepEqual(
    { topologyMutations, optionDeletes, blocks },
    { topologyMutations: 0, optionDeletes: 1, blocks: 0 },
  );
});

test("keep-option execution preserves the existing topology mutation path", async () => {
  const accounts = [account("A"), account("B")];
  const decision = decide({ targetAccount: accounts[0], accounts });
  let topologyMutations = 0;
  let optionDeletes = 0;
  let blocks = 0;

  await executeProposalRowRemovalDecision(decision, {
    onKeepOption: () => {
      topologyMutations += 1;
    },
    onDeleteOption: async () => {
      optionDeletes += 1;
    },
    onBlockLastOption: () => {
      blocks += 1;
    },
  });

  assert.deepEqual(
    { topologyMutations, optionDeletes, blocks },
    { topologyMutations: 1, optionDeletes: 0, blocks: 0 },
  );
});

test("last-option execution blocks without topology mutation or option deletion", async () => {
  const standalone = account("A");
  const decision = decide({
    targetAccount: standalone,
    accounts: [standalone],
    optionIndexes: [0],
  });
  let topologyMutations = 0;
  let optionDeletes = 0;
  let blocks = 0;

  await executeProposalRowRemovalDecision(decision, {
    onKeepOption: () => {
      topologyMutations += 1;
    },
    onDeleteOption: async () => {
      optionDeletes += 1;
    },
    onBlockLastOption: () => {
      blocks += 1;
    },
  });

  assert.deepEqual(
    { topologyMutations, optionDeletes, blocks },
    { topologyMutations: 0, optionDeletes: 0, blocks: 1 },
  );
});
