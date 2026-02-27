import { TableRow } from './campaign-history-table-item/TableRow';
import type { Campaign } from '../../types/campaign-history.types';

import './_campaign-history-table.scss';
import { TableCardSkeleton } from "@/shared/ui/skeletons/table-card-skeleton.tsx";

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
      <div style={{ fontSize: 40, textAlign: "center", padding: 40 }}>
        Campaigns history is empty. Try to check your promos.
      </div>
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
          <TableRow key={campaign.campaignId} campaign={campaign}/>
        ))
      }
      </tbody>
    </table>
  );
};