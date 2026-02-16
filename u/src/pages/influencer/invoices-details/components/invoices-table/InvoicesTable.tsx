import { TableRow } from './invoices-table-row/TableRow';
import { TableSpacerRow } from './table-spacer-row/TableSpacerRow';
import type { IInvoiceResponseModel } from '../../types/invoice';

import './_invoices-table.scss';

interface Props {
  invoices: IInvoiceResponseModel[];
}

export const InvoicesTable: React.FC<Props> = ({ invoices }) => {
  //
  return (
    <div className="table-card-influencer">
      <table className="custom-table-influencer">
        <thead className='custom-table__thead'>
          <tr className='custom-table__thead-tr'>
            <th className='custom-table__thead-th'>Invoice ID</th>
            <th className='custom-table__thead-th'>Date Issued</th>
            <th className='custom-table__thead-th'>Payment Method</th>
            <th className='custom-table__thead-th'>Amount</th>
            <th className='custom-table__thead-th'>Status</th>
          </tr>
        </thead>
        <tbody className='custom-table__tbody'>
          <TableSpacerRow colSpan={5} />
          {invoices.map((item) => (
            <TableRow key={item.shortInvoiceId} item={item} />
          ))}
          <TableSpacerRow colSpan={5} />
        </tbody>
        <tfoot className='custom-table__footer'></tfoot>
      </table >
      {/* <div className='custom-table__footer' /> */}
    </div>
  );
};