import assert from "node:assert/strict";
import test from "node:test";

import {
  buildWorkingProposalOptionProjection,
  decideProposalOptionSwitchIntent,
  discardBeforeProposalOptionSwitch,
  isProposalOptionDirty,
  saveBeforeProposalOptionSwitch,
} from "../src/client-side/pages/campaign/model/proposal-option-dirty.ts";
import type {
  ProposalOptionDto,
  ProposalSelectedOfferInput,
} from "../src/entities/client-side/campaign/model/campaign-api.types.ts";
import type {
  MutableProposalAccount,
  MutableProposalContent,
  ProposalContentPatch,
} from "../src/client-side/utils/proposal-patch.ts";

const selection = (
  contentId = "content-a",
  descriptionId = "description-a",
  additionalBriefId?: string,
) => ({
  campaignContentItemId: contentId,
  descriptionId,
  ...(additionalBriefId ? { additionalBriefId } : {}),
});

const content = (
  id = "content-a",
  descriptions = [{ _id: "description-a", description: "Description A" }],
  additionalBrief = [] as Array<{ _id: string; additionalBrief: string }>,
) => ({
  _id: id,
  socialMedia: "instagram" as const,
  profileType: "community" as const,
  socialMediaGroup: "main" as const,
  mainLink: `https://example.com/${id}`,
  descriptions,
  taggedUser: "",
  taggedLink: "",
  additionalBrief,
});

const account = (
  id: string,
  {
    addedAccountsId = `added-${id}`,
    bundleId,
    selected = selection(),
    dateRequest = "ASAP",
  }: {
    addedAccountsId?: string | null;
    bundleId?: string;
    selected?: ReturnType<typeof selection> | null;
    dateRequest?: string;
  } = {},
) => ({
  ...(addedAccountsId ? { addedAccountsId } : {}),
  socialAccountId: id,
  accountId: id,
  influencerId: `influencer-${id}`,
  socialMedia: "instagram",
  username: id,
  ...(bundleId ? { bundleId } : {}),
  dateRequest,
  selectedContent: selected,
  selectedCampaignContentItem: selected,
});

const snapshot = ({
  accounts = [account("A")],
  contentItems = [content()],
  bundleIds = [] as string[],
  offer = null as ProposalOptionDto["selectedOffer"],
} = {}): ProposalOptionDto => ({
  optionIndex: 1,
  price: 100,
  displayCurrency: "EUR",
  addedAccounts: accounts as ProposalOptionDto["addedAccounts"],
  addedBundles: bundleIds.map((bundleId) => ({
    campaignBundleId: `campaign-${bundleId}`,
    bundleId,
    influencerId: `influencer-${bundleId}`,
    acceptancePolicy: "all_or_nothing",
    influencerReward: 10,
    clientPrice: 20,
    originalInfluencerReward: 10,
    originalClientPrice: 20,
    pricingStrategy: "proportional",
    currency: "EUR",
    snapshotAt: "2026-01-01T00:00:00.000Z",
  })),
  selectedOffer: offer,
  campaignContent: contentItems,
  canEdit: true,
});

const dirty = ({
  authoritative = snapshot(),
  accounts = authoritative.addedAccounts,
  contentItems = authoritative.campaignContent,
  patches = {},
  bundles = {},
  selectedOfferChange,
}: {
  authoritative?: ProposalOptionDto;
  accounts?: MutableProposalAccount[];
  contentItems?: MutableProposalContent[];
  patches?: Record<string, ProposalContentPatch>;
  bundles?: Record<string, string[]>;
  selectedOfferChange?: ProposalSelectedOfferInput | null;
} = {}) => isProposalOptionDirty({
  snapshot: authoritative,
  accounts,
  content: contentItems,
  patches,
  pendingBundleMembership: bundles,
  ...(selectedOfferChange !== undefined ? { selectedOfferChange } : {}),
});

test("exact authoritative state is clean", () => {
  assert.equal(dirty(), false);
});

test("adding a standalone account without a fabricated lifecycle id is dirty", () => {
  const authoritative = snapshot();
  assert.equal(dirty({
    authoritative,
    accounts: [...authoritative.addedAccounts, account("D", { addedAccountsId: null })],
  }), true);
});

test("removing an account is dirty", () => {
  const authoritative = snapshot({ accounts: [account("A"), account("B")] });
  assert.equal(dirty({ authoritative, accounts: [authoritative.addedAccounts[0]] }), true);
});

test("replacing Bundle topology with Offer topology is dirty", () => {
  const authoritative = snapshot({
    accounts: [account("A", { bundleId: "bundle-1" }), account("B", { bundleId: "bundle-1" })],
    bundleIds: ["bundle-1"],
  });
  const accounts = authoritative.addedAccounts.map((item) => ({
    ...item,
    bundleId: undefined,
  }));

  assert.equal(dirty({
    authoritative,
    accounts,
    selectedOfferChange: { offerId: "offer-1", selectedAccountIds: ["A", "B"] },
  }), true);
});

test("Content, Description, and Date changes are dirty", () => {
  const authoritative = snapshot({
    contentItems: [content("content-a"), content("content-b", [
      { _id: "description-b", description: "Description B" },
    ])],
  });

  assert.equal(dirty({
    authoritative,
    accounts: [account("A", { selected: selection("content-b", "description-b") })],
  }), true);
  assert.equal(dirty({
    authoritative,
    accounts: [account("A", { selected: selection("content-a", "other-description") })],
  }), true);
  assert.equal(dirty({
    authoritative,
    accounts: [account("A", { dateRequest: "BEFORE:2026-12-01" })],
  }), true);
});

test("a semantic change reverted to the authoritative state is clean", () => {
  const authoritative = snapshot();
  const finalWorkingAccounts = [account("A")];
  assert.equal(dirty({ authoritative, accounts: finalWorkingAccounts }), false);
});

test("UI and catalog metadata do not make the Proposal dirty", () => {
  const authoritative = snapshot();
  const working = [{
    ...authoritative.addedAccounts[0],
    followers: 999_999,
    logoUrl: "https://example.com/new-logo.png",
    source: "bundle",
    publicPrice: 999,
  }];
  assert.equal(dirty({ authoritative, accounts: working }), false);
});

test("harmless account array reordering is clean", () => {
  const authoritative = snapshot({ accounts: [account("A"), account("B")] });
  assert.equal(dirty({
    authoritative,
    accounts: [...authoritative.addedAccounts].reverse(),
  }), false);
});

test("Offer member order is canonicalized", () => {
  const authoritative = snapshot({
    accounts: [account("A"), account("B")],
    offer: {
      campaignOfferId: "campaign-offer-1",
      offerId: "offer-1",
      selectedAccountIds: ["A", "B"],
      selectedAddedAccountsIds: ["added-A", "added-B"],
      overlapAccountIds: [],
      title: "Offer",
      socialMedia: "instagram",
      genre: "music",
      clientPrice: 100,
      originalClientPrice: 100,
      currency: "EUR",
      snapshotAt: "2026-01-01T00:00:00.000Z",
    },
  });

  assert.equal(dirty({
    authoritative,
    selectedOfferChange: {
      offerId: "offer-1",
      selectedAccountIds: ["B", "A"],
      selectedAddedAccountsIds: ["added-B", "added-A"],
    },
  }), false);
});

test("Bundle package and member order is canonicalized", () => {
  const authoritative = snapshot({
    accounts: [
      account("A", { bundleId: "bundle-1" }),
      account("B", { bundleId: "bundle-1" }),
      account("C", { bundleId: "bundle-2" }),
    ],
    bundleIds: ["bundle-1", "bundle-2"],
  });

  assert.equal(dirty({
    authoritative,
    accounts: [...authoritative.addedAccounts].reverse(),
  }), false);
});

test("Content aliases with the same effective pair are clean", () => {
  const authoritative = snapshot();
  const working = [{
    ...authoritative.addedAccounts[0],
    selectedContent: null,
    selectedCampaignContentItem: selection(),
  }];
  assert.equal(dirty({ authoritative, accounts: working }), false);
});

test("persisted Content fallback is clean when the current aliases are absent", () => {
  const authoritative = snapshot();
  const workingAccount = { ...authoritative.addedAccounts[0] };
  delete workingAccount.selectedContent;
  delete workingAccount.selectedCampaignContentItem;
  const working = [workingAccount];
  assert.equal(dirty({ authoritative, accounts: working }), false);
});

test("malformed current Content selection is dirty", () => {
  const authoritative = snapshot();
  const working = [{
    ...authoritative.addedAccounts[0],
    selectedContent: { campaignContentItemId: "content-a", descriptionId: "" },
  }];
  assert.equal(dirty({ authoritative, accounts: working }), true);
});

test("retained lifecycle identity remains clean and losing it is dirty", () => {
  const authoritative = snapshot();
  assert.equal(dirty({ authoritative }), false);

  const working = [{ ...authoritative.addedAccounts[0], addedAccountsId: undefined }];
  assert.equal(dirty({ authoritative, accounts: working }), true);
});

test("effective Content text patches become clean again after revert", () => {
  const authoritative = snapshot();
  assert.equal(dirty({
    authoritative,
    patches: { "content-a": { mainLink: "https://example.com/changed" } },
  }), true);
  assert.equal(dirty({
    authoritative,
    patches: { "content-a": { mainLink: "https://example.com/content-a" } },
  }), false);
});

test("effective Description text patches become clean again after revert", () => {
  const authoritative = snapshot();
  assert.equal(dirty({
    authoritative,
    patches: {
      "content-a": {
        descriptions: [{ _id: "description-a", description: "Changed" }],
      },
    },
  }), true);
  assert.equal(dirty({
    authoritative,
    patches: {
      "content-a": {
        descriptions: [{ _id: "description-a", description: "Description A" }],
      },
    },
  }), false);
});

test("editing an unused Content item is dirty and reverting it is clean", () => {
  const authoritative = snapshot({
    contentItems: [content("content-a"), content("content-b")],
  });

  assert.equal(dirty({
    authoritative,
    patches: { "content-b": { mainLink: "https://example.com/changed" } },
  }), true);
  assert.equal(dirty({
    authoritative,
    patches: { "content-b": { mainLink: "https://example.com/content-b" } },
  }), false);
});

test("Additional Brief selection uses the same effective first-item fallback", () => {
  const briefs = [
    { _id: "brief-a", additionalBrief: "Brief A" },
    { _id: "brief-b", additionalBrief: "Brief B" },
  ];
  const authoritative = snapshot({
    accounts: [account("A", { selected: selection() })],
    contentItems: [content("content-a", undefined, briefs)],
  });

  assert.equal(dirty({ authoritative }), false);
  assert.equal(dirty({
    authoritative,
    accounts: [account("A", {
      selected: selection("content-a", "description-a", "brief-a"),
    })],
  }), false);
  assert.equal(dirty({
    authoritative,
    accounts: [account("A", {
      selected: selection("content-a", "description-a", "brief-b"),
    })],
  }), true);
});

test("unused Additional Brief edits are dirty and exact revert is clean", () => {
  const authoritativeBriefs = [
    { _id: "brief-a", additionalBrief: "Brief A" },
    { _id: "brief-b", additionalBrief: "Brief B" },
  ];
  const authoritative = snapshot({
    contentItems: [content("content-a", undefined, authoritativeBriefs)],
  });

  assert.equal(dirty({
    authoritative,
    patches: {
      "content-a": {
        additionalBrief: [
          authoritativeBriefs[0],
          { ...authoritativeBriefs[1], additionalBrief: "Changed" },
        ],
      },
    },
  }), true);
  assert.equal(dirty({
    authoritative,
    patches: { "content-a": { additionalBrief: authoritativeBriefs } },
  }), false);
});

test("a new unreferenced Content item is dirty and removing it restores clean", () => {
  const authoritative = snapshot();
  assert.equal(dirty({
    authoritative,
    contentItems: [...authoritative.campaignContent, content("content-b")],
  }), true);
  assert.equal(dirty({
    authoritative,
    contentItems: authoritative.campaignContent,
  }), false);
});

test("deleting an unused persisted Content item is dirty", () => {
  const authoritative = snapshot({
    contentItems: [content("content-a"), content("content-b")],
  });

  assert.equal(dirty({
    authoritative,
    contentItems: [content("content-a")],
  }), true);
});

test("row Content relation changes independently from the full library", () => {
  const authoritative = snapshot({
    accounts: [account("A", { selected: selection("content-b", "description-b") })],
    contentItems: [
      content("content-a"),
      content("content-b", [{ _id: "description-b", description: "Description B" }]),
    ],
  });
  const workingAccounts = [account("A", {
    selected: selection("content-a", "description-a"),
  })];

  assert.equal(dirty({ authoritative, accounts: workingAccounts }), true);

  const refreshed = snapshot({
    accounts: workingAccounts,
    contentItems: authoritative.campaignContent,
  });
  assert.equal(dirty({ authoritative: refreshed }), false);
});

test("working projection has a deterministic serializable shape", () => {
  const authoritative = snapshot();
  const projection = buildWorkingProposalOptionProjection({
    snapshot: authoritative,
    accounts: authoritative.addedAccounts,
    content: authoritative.campaignContent,
  });
  assert.doesNotThrow(() => JSON.stringify(projection));
  assert.deepEqual(projection?.issues, []);
});

test("switch intent no-ops for the active Option and distinguishes clean/dirty targets", () => {
  assert.deepEqual(decideProposalOptionSwitchIntent({
    activeOptionIndex: 2,
    targetOptionIndex: 2,
    isDirty: true,
  }), { kind: "no_op" });
  assert.deepEqual(decideProposalOptionSwitchIntent({
    activeOptionIndex: 2,
    targetOptionIndex: 3,
    isDirty: false,
  }), { kind: "switch", targetOptionIndex: 3 });
  assert.deepEqual(decideProposalOptionSwitchIntent({
    activeOptionIndex: 2,
    targetOptionIndex: 3,
    isDirty: true,
  }), { kind: "confirm", targetOptionIndex: 3 });
});

test("deferred switch runs only after Save success", async () => {
  const events: string[] = [];
  const failed = await saveBeforeProposalOptionSwitch({
    targetOptionIndex: 3,
    saveCurrentOption: async () => {
      events.push("save-failed");
      return false;
    },
    switchOption: async () => events.push("switch"),
  });
  assert.equal(failed, false);
  assert.deepEqual(events, ["save-failed"]);

  events.length = 0;
  const succeeded = await saveBeforeProposalOptionSwitch({
    targetOptionIndex: 3,
    saveCurrentOption: async () => {
      events.push("save-success");
      return true;
    },
    switchOption: async (index) => events.push(`switch-${index}`),
  });
  assert.equal(succeeded, true);
  assert.deepEqual(events, ["save-success", "switch-3"]);
});

test("Discard resets historical state, restores authoritative working state, then switches", async () => {
  const events: string[] = [];
  const discarded = await discardBeforeProposalOptionSwitch({
    targetOptionIndex: 3,
    resetHistoricalState: () => events.push("reset-history"),
    restoreCurrentOption: () => {
      events.push("restore-current");
      return true;
    },
    switchOption: async (index) => events.push(`switch-${index}`),
  });

  assert.equal(discarded, true);
  assert.deepEqual(events, [
    "reset-history",
    "restore-current",
    "switch-3",
  ]);
});

test("Discard does not switch when the authoritative snapshot cannot be restored", async () => {
  const events: string[] = [];
  const discarded = await discardBeforeProposalOptionSwitch({
    targetOptionIndex: 3,
    resetHistoricalState: () => events.push("reset-history"),
    restoreCurrentOption: () => false,
    switchOption: async () => events.push("switch"),
  });

  assert.equal(discarded, false);
  assert.deepEqual(events, ["reset-history"]);
});
