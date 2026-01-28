import { useEffect, useRef } from "react";
import { useCampaignStore } from "@/store/client/createCampaign";

export function useResetCampaignOnLeave() {
  const { actions } = useCampaignStore();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    return () => {
      actions.resetCampaign();
    };
  }, [actions]);
}
