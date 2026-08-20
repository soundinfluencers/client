import assert from "node:assert/strict";
import test from "node:test";

import { useProposalAccountsStore } from "../src/client-side/store/proposal-store/proposal-accounts.ts";
import { selectCreatedProposalContentForAccount } from "../src/client-side/widgets/campaign/model/proposal-created-content-selection.ts";
import { isProposalOptionDirty } from "../src/client-side/pages/campaign/model/proposal-option-dirty.ts";
import { buildProposalOptionPatchBody } from "../src/client-side/utils/proposal-patch.ts";
import type { ProposalOptionDto } from "../src/entities/client-side/campaign/model/campaign-api.types.ts";

const optionIndex = 2;
const video1Selection = {
  campaignContentItemId: "video-1",
  descriptionId: "description-1",
};

const content = (
  id: string,
  descriptions = [{ _id: "description-1", description: "Description 1" }],
) => ({
  _id: id,
  socialMedia: "instagram" as const,
  profileType: "community" as const,
  socialMediaGroup: "main" as const,
  mainLink: `https://example.com/${id}`,
  taggedUser: "",
  taggedLink: "",
  additionalBrief: [],
  descriptions,
});

const account = (id: string) => ({
  addedAccountsId: `added-${id}`,
  socialAccountId: id,
  accountId: id,
  influencerId: `influencer-${id}`,
  socialMedia: "instagram",
  profileType: "community" as const,
  username: id,
  publicPrice: 0,
  followers: 0,
  dateRequest: "ASAP",
  selectedContent: video1Selection,
  selectedCampaignContentItem: video1Selection,
});

const initialize = (accounts = [account("A")]) => {
  useProposalAccountsStore.getState().clearAll();
  const video1 = content("video-1");
  useProposalAccountsStore.getState().initOption(
    optionIndex,
    accounts,
    [video1],
    { force: true },
  );
  useProposalAccountsStore.getState().setOptionSnapshot({
    optionIndex,
    price: 100,
    displayCurrency: "EUR",
    addedAccounts: accounts,
    addedBundles: [],
    selectedOffer: null,
    campaignContent: [video1],
    canEdit: true,
  } as ProposalOptionDto);
};

const createAndSelect = (accountKey = "added-A") => {
  const store = useProposalAccountsStore.getState();
  const created = store.addContentForSocial(
    optionIndex,
    "instagram",
    { mainLink: "https://example.com/video-2" },
    "video-1",
  );
  const selected = selectCreatedProposalContentForAccount({
    optionIndex,
    accountKey,
    created,
    setAccountSelectedContent:
      useProposalAccountsStore.getState().setAccountSelectedContent,
  });

  return { created, selected };
};

test("new Content is selected in the triggering row through exact returned IDs", () => {
  initialize([account("A"), account("B")]);
  const { created, selected } = createAndSelect();
  const state = useProposalAccountsStore.getState();
  const rows = state.accountsByOption[optionIndex];
  const expected = {
    campaignContentItemId: created.contentId,
    descriptionId: created.firstDescriptionId,
  };

  assert.equal(selected, true);
  assert.deepEqual(
    state.contentByOption[optionIndex].map((item) => item._id),
    ["video-1", created.contentId],
  );
  const createdContent = state.contentByOption[optionIndex].find(
    (item) => item._id === created.contentId,
  );
  assert.equal(
    createdContent?.descriptions[0]?._id,
    created.firstDescriptionId,
  );
  assert.notEqual(created.firstDescriptionId, "description-1");
  assert.deepEqual(rows[0].selectedContent, expected);
  assert.deepEqual(rows[0].selectedCampaignContentItem, expected);
  assert.deepEqual(rows[1].selectedContent, video1Selection);
  assert.deepEqual(rows[1].selectedCampaignContentItem, video1Selection);
});

test("immediate Save accepts the auto-selected pair and retains the full library", () => {
  initialize();
  const { created } = createAndSelect();
  const state = useProposalAccountsStore.getState();
  const snapshot = state.optionSnapshotsByIndex[optionIndex];

  assert.ok(snapshot);
  const result = buildProposalOptionPatchBody({
    campaignName: "Proposal",
    snapshot,
    accounts: state.accountsByOption[optionIndex],
    content: state.contentByOption[optionIndex],
    patches: {},
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(
    result.body.campaignContent?.map((item) => item._id),
    ["video-1", created.contentId],
  );
  assert.deepEqual(
    result.body.addedAccounts?.[0]?.selectedCampaignContentItem,
    {
      campaignContentItemId: created.contentId,
      descriptionId: created.firstDescriptionId,
    },
  );
  assert.equal(
    isProposalOptionDirty({
      snapshot,
      accounts: state.accountsByOption[optionIndex],
      content: state.contentByOption[optionIndex],
      patches: {},
    }),
    true,
  );
});

test("missing created Description preserves the previous valid row selection", () => {
  initialize();
  const before = useProposalAccountsStore.getState().accountsByOption[optionIndex][0];
  const selected = selectCreatedProposalContentForAccount({
    optionIndex,
    accountKey: "added-A",
    created: { contentId: "video-2", firstDescriptionId: "" },
    setAccountSelectedContent:
      useProposalAccountsStore.getState().setAccountSelectedContent,
  });
  const after = useProposalAccountsStore.getState().accountsByOption[optionIndex][0];

  assert.equal(selected, false);
  assert.deepEqual(after.selectedContent, before.selectedContent);
  assert.deepEqual(
    after.selectedCampaignContentItem,
    before.selectedCampaignContentItem,
  );
});

test("each explicit creation selects its own IDs without duplicates", () => {
  initialize();
  const first = createAndSelect();
  const second = createAndSelect();
  const state = useProposalAccountsStore.getState();
  const ids = state.contentByOption[optionIndex].map((item) => item._id);

  assert.equal(new Set(ids).size, 3);
  assert.equal(ids.length, 3);
  assert.deepEqual(state.accountsByOption[optionIndex][0].selectedContent, {
    campaignContentItemId: second.created.contentId,
    descriptionId: second.created.firstDescriptionId,
  });
  assert.notEqual(first.created.contentId, second.created.contentId);
});

test("switching back manually does not remove the created Content entity", () => {
  initialize();
  const { created } = createAndSelect();

  useProposalAccountsStore.getState().setAccountSelectedContent(
    optionIndex,
    "added-A",
    video1Selection,
  );

  const state = useProposalAccountsStore.getState();
  assert.deepEqual(
    state.contentByOption[optionIndex].map((item) => item._id),
    ["video-1", created.contentId],
  );
  assert.deepEqual(
    state.accountsByOption[optionIndex][0].selectedContent,
    video1Selection,
  );
});

test("new Content auto-selection uses its exact cloned first Brief ID", () => {
  useProposalAccountsStore.getState().clearAll();
  const video1 = {
    ...content("video-1"),
    additionalBrief: [
      { _id: "brief-1", additionalBrief: "Brief 1" },
    ],
  };
  useProposalAccountsStore.getState().initOption(
    optionIndex,
    [account("A")],
    [video1],
    { force: true },
  );

  const { created } = createAndSelect();
  const row = useProposalAccountsStore.getState()
    .accountsByOption[optionIndex][0];
  const createdContent = useProposalAccountsStore.getState()
    .contentByOption[optionIndex]
    .find((item) => item._id === created.contentId);

  assert.ok(created.firstAdditionalBriefId);
  assert.equal(
    created.firstAdditionalBriefId,
    createdContent?.additionalBrief[0]?._id,
  );
  assert.notEqual(created.firstAdditionalBriefId, "brief-1");
  assert.equal(
    row.selectedCampaignContentItem?.additionalBriefId,
    created.firstAdditionalBriefId,
  );
  assert.deepEqual(row.selectedContent, row.selectedCampaignContentItem);
});
