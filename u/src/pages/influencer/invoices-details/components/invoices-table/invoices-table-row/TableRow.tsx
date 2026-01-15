import type { IInvoiceDetailsItem } from '../../../types/invoice';
import './_table-row.scss';

interface Props {
  item: IInvoiceDetailsItem;
};

export const TableRow = ({ item }: Props) => {
  return (
    <tr className="custom-table-row">
      <td className="custom-table-row__cell">{item.invoiceId}</td>
      <td className="custom-table-row__cell">{item.dateIssued}</td>
      <td className="custom-table-row__cell">{item.paymentMethod}</td>
      <td className="custom-table-row__cell">{(item.amount / 100)} EUR</td>
      <td className="custom-table-row__cell">
        <span className={`custom-table-row__status-badge`}>
          {item.status}
        </span>
        {item.description}
      </td>
    </tr>
  );
};