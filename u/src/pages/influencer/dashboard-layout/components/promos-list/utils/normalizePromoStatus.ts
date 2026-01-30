import type {TClosedStatusType, TConfirmationType} from "@/pages/influencer/promos/types/promos.types.ts";

export const normalizePromoStatus = (confirmation: TConfirmationType, closedStatus: TClosedStatusType): string => {
    if (confirmation === 'wait' && closedStatus === "wait") {
        return 'New request';
    } else if (confirmation === 'accept' && closedStatus === 'wait') {
        return "Distributing";
    } else if (closedStatus === 'close') {
        return "Completed";
    }

    return "";
};