import { PromosDetailsListCard } from "../../../components/promos-details-list/promos-details-list-card/PromosDetailsListCard";
import type {
  NewPromo,
  StandaloneNewPromo,
  TBundlePromoDecisionRequest,
  TPromoDecisionRequest,
  TStandalonePromoDecisionRequest,
} from "../../../types/promos.types";
import { BundleNewPromoCard } from "../bundle-new-promo-card/BundleNewPromoCard";
import {
  buildBundleDecisionRequest,
  canSubmitBundleDecision,
} from "../../utils/new-promos-decision";

import "../../../components/promos-details-list/_promos-details-list.scss";

interface Props {
  data: NewPromo[];
  mutationState?: {
    isPending: boolean;
    variables?: TPromoDecisionRequest;
  };
  pendingBundleIds: ReadonlySet<string>;
  onAccept?: (payload: TPromoDecisionRequest) => void;
  onDecline?: (payload: TPromoDecisionRequest) => void;
}

const getStandaloneActionPayload = (
  promo: StandaloneNewPromo,
  campaignResponse: TStandalonePromoDecisionRequest["campaignResponse"],
): TStandalonePromoDecisionRequest => ({
  campaignId: promo.campaignId,
  addedAccountsId: promo.addedAccountsId,
  username: promo.username,
  campaignResponse,
});

export const NewPromosList = ({
  data,
  mutationState,
  pendingBundleIds,
  onAccept,
  onDecline,
}: Props) => (
  <div className="promos-details-list">
    {data.map((promo, index) => {
      if (promo.promoType === "bundle") {
        const canSubmitDecision = canSubmitBundleDecision(promo);

        const handleBundleDecision = (
          campaignResponse: TBundlePromoDecisionRequest["campaignResponse"],
        ) => {
          const payload = buildBundleDecisionRequest(promo, campaignResponse);

          if (!payload) {
            return;
          }

          if (campaignResponse === "accept") {
            onAccept?.(payload);
            return;
          }

          onDecline?.(payload);
        };

        return (
          <BundleNewPromoCard
            key={`bundle:${promo.campaignId}:${promo.campaignBundleId}`}
            promo={promo}
            index={index}
            isPending={pendingBundleIds.has(promo.campaignBundleId)}
            onAccept={
              canSubmitDecision && onAccept
                ? () => handleBundleDecision("accept")
                : undefined
            }
            onDecline={
              canSubmitDecision && onDecline
                ? () => handleBundleDecision("decline")
                : undefined
            }
          />
        );
      }

      const standaloneVariables =
        mutationState?.variables &&
        "addedAccountsId" in mutationState.variables
          ? mutationState.variables
          : undefined;
      const isPromoPending =
        mutationState?.isPending &&
        standaloneVariables?.campaignId === promo.campaignId;

      return (
        <PromosDetailsListCard
          key={`standalone:${promo.campaignId}:${promo.addedAccountsId}`}
          promo={promo}
          status="pending"
          index={index}
          isPending={isPromoPending}
          pendingAction={standaloneVariables?.campaignResponse}
          onAccept={() =>
            onAccept?.(getStandaloneActionPayload(promo, "accept"))
          }
          onDecline={() =>
            onDecline?.(getStandaloneActionPayload(promo, "decline"))
          }
        />
      );
    })}
  </div>
);
