import { PromosTableItem } from './promos-table-item/PromosTableItem';
import type { IPromo } from '@/pages/influencer/promos/types/promos.types';
import { TableCardSkeleton } from "@/shared/ui/skeletons/table-card-skeleton.tsx";
import './_promos-table.scss';

interface Props {
  promos: IPromo[];
  isLoading?: boolean;
  isFetching?: boolean;
}

export const PromosTable = ({ promos, isLoading, isFetching }: Props) => {
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
        {isLoading || isFetching ? (
          Array.from({ length: 12 }).map((_, index) => (
            <tr key={index} className='promos-table__tbody-tr'>
              <td colSpan={4}>
                <TableCardSkeleton />
              </td>
            </tr>
          ))
        ) : promos.length === 0 ? (
          <tr className='promos-table__tbody-tr'>
            <td colSpan={4} style={{ fontSize: 48, textAlign: 'center', padding: 40 }}>
              No promos found.
            </td>
          </tr>
        ) : (
          promos.map((promo) => (
            <PromosTableItem key={promo.addedAccountsId + promo.campaignId} promo={promo} />
          ))
        )}
        {/*{promos.map((promo) => (*/}
        {/*  <PromosTableItem key={promo.addedAccountsId} promo={promo} />*/}
        {/*))}*/}
      </tbody>
    </table>
  );
};