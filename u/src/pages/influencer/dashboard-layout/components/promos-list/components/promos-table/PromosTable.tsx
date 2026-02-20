import { PromosTableItem } from './promos-table-item/PromosTableItem';
import type { IPromo } from '@/pages/influencer/promos/types/promos.types';
import { TableCardSkeleton } from "@/shared/ui/skeletons/table-card-skeleton.tsx";
import './_promos-table.scss';

interface Props {
  promos: IPromo[];
  isInitialLoading?: boolean;
  isRefreshing?: boolean;
}

export const PromosTable = ({ promos, isInitialLoading, isRefreshing }: Props) => {

  if (isInitialLoading) {
    return (
      <table className="promos-table">
        <thead className="promos-table__thead">
        <tr className="promos-table__thead-tr">
          <th className="promos-table__thead-th">Status</th>
          <th className="promos-table__thead-th">Date post</th>
          <th className="promos-table__thead-th">Name</th>
          <th className="promos-table__thead-th">Reward</th>
        </tr>
        </thead>

        <tbody className="promos-table__tbody">
        {Array.from({ length: 12 }).map((_, index) => (
          <tr key={index}>
            <td colSpan={4}>
              <TableCardSkeleton />
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    );
  }

  if (promos.length === 0) {
    return (
      <div style={{ fontSize: 40, textAlign: "center", padding: 40 }}>
        No promos found.
      </div>
    );
  }

  return (
    <div className="promos-table-wrap">
      <table className={`promos-table ${isRefreshing ? "promos-table--dimmed" : ""}`}>
        <thead className="promos-table__thead">
        <tr className="promos-table__thead-tr">
          <th className="promos-table__thead-th">Status</th>
          <th className="promos-table__thead-th">Date post</th>
          <th className="promos-table__thead-th">Name</th>
          <th className="promos-table__thead-th">Reward</th>
        </tr>
        </thead>

        <tbody className="promos-table__tbody">
          {promos.map((promo) => (
            <PromosTableItem key={promo.addedAccountsId + promo.campaignId} promo={promo} />
          ))}
        </tbody>
      </table>

      {isRefreshing && (
        <div className="promos-table-overlay" aria-live="polite">
          {/*<div className="promos-table-overlay__content">*/}
          {/*  <div className="spinner" />*/}
          {/*  <span>Updating…</span>*/}
          {/*</div>*/}
        </div>
      )}
    </div>
  );
};