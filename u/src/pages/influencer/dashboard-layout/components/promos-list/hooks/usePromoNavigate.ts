import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { TClosedStatusType, TConfirmationType } from "@/pages/influencer/promos/types/promos.types.ts";

export const usePromoNavigate = () => {
  const navigate = useNavigate();

  return useCallback(
    (
      confirmation: TConfirmationType,
      closedStatus: TClosedStatusType,
      campaignId: string,
      addedAccountsId: string,
    ) => {
    if (confirmation === 'wait' && closedStatus === "wait") {
      navigate('/influencer/promos/new-promos');
      return;
    }

    if (confirmation === 'accept' && closedStatus === 'wait') {
      navigate(`/influencer/promos/distributing`, {
        state: { campaignId, addedAccountsId }
      });
      return;
    }

    if (closedStatus === 'close') {
      navigate(`/influencer/promos/completed`, {
        state: { campaignId, addedAccountsId }
      });
      return;
    }

    return navigate('/influencer/promos');
  }, [navigate]);
}