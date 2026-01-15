import { mockInvoiceDetailsData } from '../../types/invoices.data';
import { TableRow } from './invoices-table-row/TableRow';
import { TableSpacerRow } from './table-spacer-row/TableSpacerRow';

import './_invoices-table.scss';

export const InvoicesTable = () => {
  return (
    <div className="table-card">
      <table className="custom-table">
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
          {mockInvoiceDetailsData.map((item) => (
            <TableRow key={item.invoiceId} item={item} />
          ))}
          <TableSpacerRow colSpan={5} />
        </tbody>
      </table>
      <div className='custom-table__footer' />
    </div>
  );
};