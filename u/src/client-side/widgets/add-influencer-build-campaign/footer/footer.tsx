import React from "react";
import { useNavigate } from "react-router-dom";
import "./_footer.scss";
import {
  useProposalAccountsStore,
  useSelectCampaignProposal,
} from "@/client-side/store";
import { getGroupBySocial } from "../add-to-proposal/bc-prooced";
import { ButtonMain } from "@/components";
interface Props {
  optionIndex: number;
}

export const FooterAddInfluencer: React.FC<Props> = ({ optionIndex }) => {
  const { totalPrice, promoCard, actions } = useSelectCampaignProposal();
  const navigate = useNavigate();
  const addAccounts = useProposalAccountsStore((s) => s.addAccounts);
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
    <div className="footer-campaign-creator-page">
      <div className="footer-campaign-creator-page__content">
        <p>
          Networks:
          <span className="count">
            {promoCard.length > 0 ? promoCard.length : 0}
          </span>
        </p>
        <p>
          Total: <span className="count">{totalPrice}€</span>
        </p>
      </div>
      <button
        className={totalPrice > 0 ? "active" : "nonActive"}
        onClick={onAdd}>
        Add
      </button>
    </div>
  );
};
