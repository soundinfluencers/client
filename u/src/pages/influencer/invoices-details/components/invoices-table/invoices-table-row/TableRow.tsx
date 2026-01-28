import type { IInvoiceResponseModel } from '../../../types/invoice';
import './_table-row.scss';

interface Props {
  item: IInvoiceResponseModel;
};

export const TableRow = ({ item }: Props) => {
  return (
    <tr className="custom-table-row">
      <td className="custom-table-row__cell">{item.shortInvoiceId}</td>
      <td className="custom-table-row__cell">{item.creationDate}</td>
      <td className="custom-table-row__cell">{item.paymentMethod ? item.paymentMethod : 'N/A'}</td>
      <td className="custom-table-row__cell">{item.amount ? `${item.amount} EUR` : 'N/A'}</td>
      <td className="custom-table-row__cell">
        <span className={`custom-table-row__status-badge`}>
          {item.status}
        </span>
        {'Payment Due: 7 days (subject to approval)'}
      </td>
    </tr>
  );
};