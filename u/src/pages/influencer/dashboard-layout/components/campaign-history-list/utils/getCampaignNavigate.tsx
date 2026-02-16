import type {
  Campaign
} from "@/pages/influencer/dashboard-layout/components/campaign-history-list/types/campaign-history.types.ts";
import { Link } from "react-router-dom";

export const campaignNavigate = (campaign: Campaign) => {
  switch (campaign.status) {
    case 0:
      return (
        <Link
          to={"/influencer/promos/new-promos"}
          // state={
          //   {
          //     campaignId: campaign.campaignId,
          //     addedAccountsId: campaign.socialAccountId,
          //   }
          // }
          className="campaign-history-table-row__link">
          Accept/Deny Request
        </Link>
      );
    case 1:
      return (
        <Link
          to={`/influencer/promos/distributing`}
          state={{
            campaignId: campaign.campaignId,
            addedAccountsId: campaign.addedAccountsId,
          }}
          className="campaign-history-table-row__link">
          Post & Submit Insights
        </Link>
      );
    case 2:
      return (
        <Link
          to={"/influencer/create-invoice"}
          // state={{
          //   campaignId: campaign.campaignId,
          //   addedAccountsId: campaign.socialAccountId,
          // }}
          className="campaign-history-table-row__link">
          Create Invoice
        </Link>
      );
    case 3:
      return <span className="campaign-history-table-row__result">Awaiting Payment</span>;
    case 4:
      return <span className="campaign-history-table-row__result">Completed</span>;
    case 5:
      return <span className="campaign-history-table-row__result">Denied</span>;
    default:
      return <span className="campaign-history-table-row__result">N/A</span>;
  }
}
