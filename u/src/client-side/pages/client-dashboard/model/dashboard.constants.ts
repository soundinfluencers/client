import draftIcon from "@/assets/bar-home/folder-plus (1).svg";
import proposalIcon from "@/assets/bar-home/edit-2.svg";
import underReviewIcon from "@/assets/bar-home/si_hourglass-duotone.svg";
import distributingIcon from "@/assets/bar-home/distribution icon.svg";
import completedIcon from "@/assets/bar-home/check-circle.svg";
import type { CampaignFilterStatus } from "./dashboard.types";

export const DASHBOARD_STATUS_OPTIONS: Array<{
    key: Exclude<CampaignFilterStatus, "all">;
    name: string;
    icon: string;
}> = [
    { key: "draft", name: "Drafts", icon: draftIcon },
    { key: "proposal", name: "Proposals", icon: proposalIcon },
    { key: "under_review", name: "Under Review", icon: underReviewIcon },
    { key: "distributing", name: "Distributing", icon: distributingIcon },
    { key: "closed", name: "Completed", icon: completedIcon },
];

export const DASHBOARD_PAGE_SIZE = 12;