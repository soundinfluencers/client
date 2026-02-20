import { getPdffileInvoiceHistory } from "@/api/client/invoice/invoice.api";
import "./_table-row.scss";
import pdf from "@/assets/icons/iwwa_file-pdf.svg";
import { toast } from "react-toastify";
interface Props {
  item: any;
}

export const TableRow = ({ item }: Props) => {
  console.log(item, "it");
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getPdf = async (id: string) => {
    const blob = await getPdffileInvoiceHistory(id);
    downloadBlob(blob, `invoice-${id}.pdf`);
    toast.success("PDF created succesfully!");
  };
  return (
    <tr className="custom-table-row">
      <td className="custom-table-row__cell"> {item?.shortInvoiceId}</td>

      <td className="custom-table-row__cell">{item?.creationDate}</td>

      <td className="custom-table-row__cell">{item?.amount}</td>

      <td className="custom-table-row__cell custom-table-row__cell--campaign">
        <p title="ARMADA - JOA - No Games">{item?.campaignName}</p>
        <div
          onClick={() => getPdf(item.invoiceId)}
          className="custom-table-row__pdf">
          <img src={pdf} alt="" />
          <p>PDF File</p>
        </div>
      </td>
    </tr>
  );
};
