import "./_table-row.scss";
import pdf from "@/assets/icons/iwwa_file-pdf.svg";
interface Props {
  item: any;
}

export const TableRow = ({ item }: Props) => {
  console.log(item, "it");
  return (
    <tr className="custom-table-row">
      <td className="custom-table-row__cell"> {item?.shortInvoiceId}</td>

      <td className="custom-table-row__cell">{item?.creationDate}</td>

      <td className="custom-table-row__cell">{item?.amount}</td>

      <td className="custom-table-row__cell custom-table-row__cell--campaign">
        <p title="ARMADA - JOA - No Games">{item?.campaignName}</p>
        <div className="custom-table-row__pdf">
          <img src={pdf} alt="" />
          <p>PDF File</p>
        </div>
      </td>
    </tr>
  );
};
