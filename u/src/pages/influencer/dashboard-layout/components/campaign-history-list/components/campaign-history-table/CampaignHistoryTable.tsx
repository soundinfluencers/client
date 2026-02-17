import { TableRow } from './campaign-history-table-item/TableRow';
import type { Campaign } from '../../types/campaign-history.types';

import './_campaign-history-table.scss';
import { TableCardSkeleton } from "@/shared/ui/skeletons/table-card-skeleton.tsx";

interface Props {
  campaigns: Campaign[];
  isLoading?: boolean;
  isFetching?: boolean;
}

export const CampaignHistoryTable = ({ campaigns, isLoading, isFetching }: Props) => {
  return (
    <table className='campaign-history-table'>
      <thead className='campaign-history-table__thead'>
        <tr className='campaign-history-table__thead-tr'>
          <th className='campaign-history-table__thead-th'>Name</th>
          <th className='campaign-history-table__thead-th'>Date post</th>
          <th className='campaign-history-table__thead-th'>Reward</th>
          <th className='campaign-history-table__thead-th'>Status</th>
          <th className='campaign-history-table__thead-th'>Actions</th>
        </tr>
      </thead>
      <tbody className='campaign-history-table__tbody'>
        {isLoading || isFetching ? (
          Array.from({ length: 12 }).map((_, index) => (
            <tr key={index} className='campaign-history-table__tbody-tr'>
              <td colSpan={5}>
                <TableCardSkeleton />
              </td>
            </tr>
          ))
        ) : campaigns.length === 0 ? (
          <tr className='campaign-history-table__tbody-tr'>
            <td colSpan={5} style={{ fontSize: 48, textAlign: 'center', padding: 40 }}>
              No campaigns found.
            </td>
          </tr>
        ) : (
          campaigns.map((campaign) => (
            <TableRow key={campaign.campaignId} campaign={campaign} />
          ))
        )}
      </tbody>
    </table>
  );
};