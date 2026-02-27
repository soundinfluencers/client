import { TableRow } from './campaign-history-table-item/TableRow';
import type { Campaign } from '../../types/campaign-history.types';

import './_campaign-history-table.scss';
import { TableCardSkeleton } from "@/shared/ui/skeletons/table-card-skeleton.tsx";
import { EmptyPromosList } from "@/pages/influencer/shared/components/empty-promo-list/EmptyPromoList.tsx";

interface Props {
  campaigns: Campaign[];
  isInitialLoading?: boolean;
  // isFetching?: boolean;
}

export const CampaignHistoryTable = ({ campaigns, isInitialLoading }: Props) => {

  if (isInitialLoading) {
    return (
      <table className="campaign-history-table">
        <thead className="campaign-history-table__thead">
        <tr className="campaign-history-table__thead-tr">
          <th className="campaign-history-table__thead-th">Name</th>
          <th className="campaign-history-table__thead-th">Date post</th>
          <th className="campaign-history-table__thead-th">Reward</th>
          <th className="campaign-history-table__thead-th">Status</th>
          <th className="campaign-history-table__thead-th">Actions</th>
        </tr>
        </thead>
        <tbody className="campaign-history-table__tbody">
          {Array.from({ length: 12 }).map((_, index) => (
            <tr key={index}>
              <td colSpan={5}>
                <TableCardSkeleton/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (campaigns.length === 0) {
    return (
      <EmptyPromosList
        title={"No History Available"}
        description={"There is no activity to display yet."}
        additionalDescription={"Your campaign history will appear here once you begin working with brands."}
        isHistory
        isDashboard
      />
    );
  }

  return (
    <table className="campaign-history-table">
      <thead className="campaign-history-table__thead">
      <tr className="campaign-history-table__thead-tr">
        <th className="campaign-history-table__thead-th">Name</th>
        <th className="campaign-history-table__thead-th">Date post</th>
        <th className="campaign-history-table__thead-th">Reward</th>
        <th className="campaign-history-table__thead-th">Status</th>
        <th className="campaign-history-table__thead-th">Actions</th>
      </tr>
      </thead>
      <tbody className="campaign-history-table__tbody">
      {
        campaigns.map((campaign) => (
          <TableRow key={`${campaign.campaignId + campaign.addedAccountsId}`} campaign={campaign}/>
        ))
      }
      </tbody>
    </table>
  );
};
