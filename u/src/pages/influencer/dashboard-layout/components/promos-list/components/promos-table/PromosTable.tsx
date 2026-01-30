import { PromosTableItem } from './promos-table-item/PromosTableItem';
import type { IPromo } from '@/pages/influencer/promos/types/promos.types';
import './_promos-table.scss';

interface Props {
  promos: IPromo[];
}

export const PromosTable = ({ promos }: Props) => {
  return (
    <table className='promos-table'>
      <thead className='promos-table__thead'>
        <tr className='promos-table__thead-tr'>
          <th className='promos-table__thead-th'>Status</th>
          <th className='promos-table__thead-th'>Date post</th>
          <th className='promos-table__thead-th'>Name</th>
          <th className='promos-table__thead-th'>Reward</th>
        </tr>
      </thead>

      <tbody className='promos-table__tbody'>
        {promos.map((promo) => (
          <PromosTableItem key={promo.addedAccountsId} promo={promo} />
        ))}
      </tbody>
    </table>
  );
};