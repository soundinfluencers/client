import { TableRow } from "../invoices-table-row/table-row";
import { TableSpacerRow } from "../table-spacer-row/table-spacer-row";

import "./_invoices-table.scss";

interface Props {
  invoices: any;
}

export const InvoicesTable: React.FC<Props> = ({ invoices }) => {
  console.log(invoices, "w");
  return (
    <div className="table-card-history">
      <table className="custom-table">
        <colgroup>
          <col style={{ width: "139px" }} />
          <col style={{ width: "189px" }} />
          <col style={{ width: "144px" }} />
          <col style={{ width: "755px" }} />
        </colgroup>

        <thead className="custom-table__thead">
          <tr className="custom-table__thead-tr">
            <th className="custom-table__thead-th">Invoice ID</th>
            <th className="custom-table__thead-th">Date Issued</th>
            <th className="custom-table__thead-th">Amount</th>
            <th className="custom-table__thead-th">Campaign</th>
          </tr>
        </thead>

        <tbody className="custom-table__tbody">
          <TableSpacerRow colSpan={5} />

          {invoices.map((item) => (
            <TableRow key={item.shortInvoiceId} item={item} />
          ))}
          <TableRow key={1} item={[]} />
          <TableSpacerRow colSpan={5} />
        </tbody>

        <tfoot className="custom-table__footer" />
      </table>
    </div>
  );
};
