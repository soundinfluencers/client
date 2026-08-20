export type CreatedProposalContentSelection = {
  contentId: string;
  firstDescriptionId: string;
  firstAdditionalBriefId?: string;
};

export type ProposalContentSelectionPair = {
  campaignContentItemId: string;
  descriptionId: string;
  additionalBriefId?: string;
};

type SetAccountSelectedContent = (
  optionIndex: number,
  accountKey: string,
  selection: ProposalContentSelectionPair,
) => void;

export const selectCreatedProposalContentForAccount = ({
  optionIndex,
  accountKey,
  created,
  setAccountSelectedContent,
}: {
  optionIndex: number;
  accountKey: string;
  created: CreatedProposalContentSelection;
  setAccountSelectedContent: SetAccountSelectedContent;
}) => {
  const campaignContentItemId = String(created.contentId ?? "").trim();
  const descriptionId = String(created.firstDescriptionId ?? "").trim();
  const additionalBriefId = String(
    created.firstAdditionalBriefId ?? "",
  ).trim();

  if (!campaignContentItemId || !descriptionId) return false;

  setAccountSelectedContent(optionIndex, accountKey, {
    campaignContentItemId,
    descriptionId,
    ...(additionalBriefId ? { additionalBriefId } : {}),
  });

  return true;
};
