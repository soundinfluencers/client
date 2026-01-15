// import type { IInfluencerPromo } from '../../../../../../../types/influencer/promos/promos.types';
import { PromosTableItem } from './promos-table-item/PromosTableItem';
import './_promos-table.scss';
import type { IPromo } from '../../../../../../../api/influencer/promos/influencer-promos.api';

interface Props {
  promos: IPromo[];
};

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
          <PromosTableItem key={promo.campaignId} promo={promo} />
        ))}
      </tbody>
    </table>
  );
};

//div structure
// <div className="promos-table">
//   <div className="promos-table__header">
//     <div className="promos-table__cell">Status</div>
//     <div className="promos-table__cell">Date post</div>
//     <div className="promos-table__cell">Name</div>
//     <div className="promos-table__cell">Reward</div>
//   </div>

//   {promos.map((promo) => (
//     <div
//       key={promo.campaignId}
//       className="promos-table__row"
//       onClick={() => handleNavigate(promo.statusCampaign)}
//     >
//       <PromosTableItem promo={promo} />
//     </div>
//   ))}
// </div>