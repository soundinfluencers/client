import assert from "node:assert/strict";
import test from "node:test";

import type { ProposalOptionDto } from "../src/entities/client-side/campaign/model/campaign-api.types.ts";
import {
  buildProposalOptionPatchBody,
  type ProposalContentPatch,
} from "../src/client-side/utils/proposal-patch.ts";

const selection = (contentId: string, descriptionId: string) => ({
  campaignContentItemId: contentId,
  descriptionId,
});

const content = (
  id: string,
  mainLink = `https://example.com/${id}`,
  descriptions = [{ _id: `${id}-description-1`, description: "Description 1" }],
  additionalBrief = [] as Array<{ _id: string; additionalBrief: string }>,
) => ({
  _id: id,
  socialMedia: "instagram" as const,
  profileType: "community" as const,
  socialMediaGroup: "main" as const,
  mainLink,
  descriptions,
  taggedUser: "",
  taggedLink: "",
  additionalBrief,
});

const account = (
  id: string,
  selected = selection("video-1", "video-1-description-1"),
  socialMedia = "instagram",
) => ({
  addedAccountsId: `added-${id}`,
  socialAccountId: id,
  accountId: id,
  influencerId: `influencer-${id}`,
  socialMedia,
  username: id,
  publicPrice: 0,
  followers: 0,
  dateRequest: "ASAP",
  selectedContent: selected,
  selectedCampaignContentItem: selected,
});

const snapshot = ({
  accounts = [account("A")],
  contentItems = [content("video-1")],
}: {
  accounts?: ProposalOptionDto["addedAccounts"];
  contentItems?: ProposalOptionDto["campaignContent"];
} = {}): ProposalOptionDto => ({
  optionIndex: 0,
  price: 100,
  displayCurrency: "EUR",
  addedAccounts: accounts,
  addedBundles: [],
  selectedOffer: null,
  campaignContent: contentItems,
  canEdit: true,
});

const build = ({
  authoritative,
  accounts = authoritative.addedAccounts,
  contentItems = authoritative.campaignContent,
  patches = {},
}: {
  authoritative: ProposalOptionDto;
  accounts?: ProposalOptionDto["addedAccounts"];
  contentItems?: ProposalOptionDto["campaignContent"];
  patches?: Record<string, ProposalContentPatch>;
}) => buildProposalOptionPatchBody({
  campaignName: "Proposal",
  snapshot: authoritative,
  accounts,
  content: contentItems,
  patches,
});

test("row relation change retains an unchanged persisted Content library", () => {
  const video1 = content("video-1");
  const video2 = content("video-2");
  const authoritative = snapshot({
    accounts: [account("A", selection("video-2", "video-2-description-1"))],
    contentItems: [video1, video2],
  });

  const result = build({
    authoritative,
    accounts: [account("A", selection("video-1", "video-1-description-1"))],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal("campaignContent" in result.body, false);
  assert.equal(
    result.body.addedAccounts?.[0]?.selectedCampaignContentItem
      ?.campaignContentItemId,
    "video-1",
  );
});

test("editing an unused Content item sends the full effective library", () => {
  const authoritative = snapshot({
    contentItems: [content("video-1"), content("video-2", "A")],
  });

  const result = build({
    authoritative,
    patches: { "video-2": { mainLink: "B" } },
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(
    result.body.campaignContent?.map((item) => [item._id, item.mainLink]),
    [["video-1", "https://example.com/video-1"], ["video-2", "B"]],
  );
});

test("a new unreferenced Content item remains saveable", () => {
  const authoritative = snapshot();
  const result = build({
    authoritative,
    contentItems: [content("video-1"), content("video-2")],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(
    result.body.campaignContent?.map((item) => item._id),
    ["video-1", "video-2"],
  );
});

test("explicit Content deletion sends the reduced working library", () => {
  const authoritative = snapshot({
    contentItems: [content("video-1"), content("video-2")],
  });
  const result = build({
    authoritative,
    contentItems: [content("video-1")],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(
    result.body.campaignContent?.map((item) => item._id),
    ["video-1"],
  );
});

test("removing a semantic group keeps the store-produced reduced library", () => {
  const pressContent = {
    ...content("press-1"),
    socialMedia: "blog" as const,
    socialMediaGroup: "press" as const,
  };
  const authoritative = snapshot({
    accounts: [
      account("A"),
      account("B", selection("press-1", "press-1-description-1"), "blog"),
    ],
    contentItems: [content("video-1"), pressContent],
  });

  const result = build({
    authoritative,
    accounts: [account("A")],
    contentItems: [content("video-1")],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(
    result.body.campaignContent?.map((item) => item._id),
    ["video-1"],
  );
});

test("changing the selected Description retains every Description", () => {
  const video1 = content("video-1", "https://example.com/video-1", [
    { _id: "description-1", description: "Description 1" },
    { _id: "description-2", description: "Description 2" },
  ]);
  const authoritative = snapshot({
    accounts: [account("A", selection("video-1", "description-2"))],
    contentItems: [video1],
  });
  const result = build({
    authoritative,
    accounts: [account("A", selection("video-1", "description-1"))],
    patches: { "video-1": { mainLink: "https://example.com/changed" } },
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.body.campaignContent?.[0]?.descriptions, [
    { _id: "description-1", description: "Description 1" },
    { _id: "description-2", description: "Description 2" },
  ]);
  assert.equal(
    result.body.addedAccounts?.[0]?.selectedCampaignContentItem?.descriptionId,
    "description-1",
  );
});

test("Campaign Content order is preserved when the full library is sent", () => {
  const authoritative = snapshot();
  const result = build({
    authoritative,
    contentItems: [content("video-1"), content("video-2"), content("video-3")],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(
    result.body.campaignContent?.map((item) => item._id),
    ["video-1", "video-2", "video-3"],
  );
});

test("selected Content must still exist in the full working library", () => {
  const authoritative = snapshot();
  const result = build({
    authoritative,
    accounts: [account("A", selection("missing", "missing-description"))],
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "selected_content_not_found");
});

test("Proposal PATCH preserves all brief versions and resolves account fallback", () => {
  const briefs = [
    { _id: "brief-1", additionalBrief: "Brief 1" },
    { _id: "brief-2", additionalBrief: "Brief 2" },
  ];
  const authoritative = snapshot({
    contentItems: [content("video-1", undefined, undefined, briefs)],
  });
  const result = build({
    authoritative,
    patches: {
      "video-1": {
        additionalBrief: [briefs[0], { ...briefs[1], additionalBrief: "Updated" }],
      },
    },
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.body.campaignContent?.[0]?.additionalBrief, [
    briefs[0],
    { ...briefs[1], additionalBrief: "Updated" },
  ]);
  assert.equal(
    result.body.addedAccounts?.[0]?.selectedCampaignContentItem
      ?.additionalBriefId,
    "brief-1",
  );
});

test("stale Additional Brief selection falls back to the first brief", () => {
  const briefs = [
    { _id: "brief-1", additionalBrief: "Brief 1" },
    { _id: "brief-2", additionalBrief: "Brief 2" },
  ];
  const authoritative = snapshot({
    accounts: [account("A", {
      ...selection("video-1", "video-1-description-1"),
      additionalBriefId: "stale",
    })],
    contentItems: [content("video-1", undefined, undefined, briefs)],
  });
  const result = build({
    authoritative,
    accounts: [{
      ...authoritative.addedAccounts[0],
      dateRequest: "updated-date",
    }],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(
    result.body.addedAccounts?.[0]?.selectedCampaignContentItem
      ?.additionalBriefId,
    "brief-1",
  );
});
