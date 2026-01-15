import './_campaign-history-table.scss';
import { TableRow } from './campaign-history-table-item/TableRow';

interface Props {
  promos: any[];
};

export const CampaignHistoryTable = ({ promos }: Props) => {
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
        {promos.map((campaign) => (
           <TableRow key={campaign.campaignId} campaign={campaign} />
        ))}
      </tbody>
    </table>
  );
};