import React from "react";
import { ButtonMain } from "@/components";
import { useNavigate } from "react-router-dom";
import "./_bc_prooced.scss";
import {
  useProposalAccountsStore,
  useSelectCampaignProposal,
} from "@/client-side/store";

interface Props {
  optionIndex: number;
}
const hasContentForGroup = (
  content: { socialMediaGroup: string }[],
  group: string,
) => {
  return content.some((c) => c.socialMediaGroup === group);
};
const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"];
const MUSIC_NETWORKS = ["spotify", "soundcloud"];

export const getGroupBySocial = (
  social: string,
): "main" | "music" | "press" => {
  const s = social.toLowerCase();

  if (MAIN_NETWORKS.includes(s)) return "main";
  if (MUSIC_NETWORKS.includes(s)) return "music";
  return "press";
};
export const AddToProposal: React.FC<Props> = ({ optionIndex }) => {
  const { totalPrice, promoCard, actions } = useSelectCampaignProposal();
  const addAccounts = useProposalAccountsStore((s) => s.addAccounts);
  console.log(promoCard, "promoCard-selected");

  const navigate = useNavigate();
  const onAdd = () => {
    const { contentByOption } = useProposalAccountsStore.getState();
    const content = contentByOption[optionIndex] ?? [];

    const canBeAdded: typeof promoCard = [];
    const needFormGroups = new Set<string>();

    promoCard.forEach((account) => {
      const group = getGroupBySocial(account.socialMedia);
      const hasContent = content.some((c) => c.socialMediaGroup === group);

      if (hasContent) canBeAdded.push(account);
      else needFormGroups.add(group);
    });

    if (canBeAdded.length > 0) {
      addAccounts(optionIndex, canBeAdded);
    }

    const firstMissingGroup = Array.from(needFormGroups)[0];
    if (firstMissingGroup) {
      navigate(
        `/client/campaign/add-influencer/add-influencer-content?group=${firstMissingGroup}&option=${optionIndex}`,
      );
      return;
    }

    actions.clearPromoCards();
    navigate("/client/campaign");
  };
  return (
    <div className="bc_proceed">
      <p className="bc_proceed__text">
        Total: <span>{totalPrice}€</span>
      </p>
      <ButtonMain
        className={totalPrice <= 0 ? "nonActive" : ""}
        text={"Add"}
        onClick={onAdd}
      />
    </div>
  );
};
