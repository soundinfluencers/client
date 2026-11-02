import { isPromoId } from '@/pages/influencer/promos/model/promo-read';
import { promoSearch } from '@/pages/influencer/promos/model/promo-navigation';
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { TClosedStatusType, TConfirmationType } from "@/pages/influencer/promos/types/promos.types.ts";

export const usePromoNavigate = () => {
  const navigate = useNavigate();

  return useCallback(
    (
      confirmation: TConfirmationType | undefined,
      closedStatus: TClosedStatusType | undefined,
      campaignId: string,
      addedAccountsId: string,
    ) => {
    if (!isPromoId(campaignId) || !isPromoId(addedAccountsId)) return;
    const search = promoSearch({ campaignId, addedAccountsId });
    if (confirmation === 'wait' && closedStatus === "wait") {
      navigate('/influencer/promos/new-promos' + search, {
        state: { campaignId, addedAccountsId }
      });
      return;
    }

    if (confirmation === 'accept' && closedStatus === 'wait') {
      navigate(`/influencer/promos/distributing${search}`, {
        state: { campaignId, addedAccountsId }
      });
      return;
    }

    if (closedStatus === 'close') {
      navigate(`/influencer/promos/completed${search}`, {
        state: { campaignId, addedAccountsId }
      });
      return;
    }

    return navigate('/influencer/promos');
  }, [navigate]);
}
