import { getPdffileInvoiceHistory } from "@/api/client/invoice/invoice.api";
import "./_table-row.scss";
import pdf from "@/assets/icons/iwwa_file-pdf.svg";
import edit from "@/assets/icons/edit.svg";
import { toast } from "react-toastify";
import React from "react";
interface Props {
  item: any;
}

export const TableRow = ({ item }: Props) => {
  const [isRequestingPDF, setisRequestingPDF] = React.useState(false);
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
    try {
      setisRequestingPDF(true);
      const blob = await getPdffileInvoiceHistory(id);
      downloadBlob(blob, `invoice-${id}.pdf`);
    } catch (error) {
      console.log(error);
    } finally {
      setisRequestingPDF(false);
      toast.success("PDF created succesfully!");
    }
  };
  return (
    <tr className="custom-table-row">
      <td className="custom-table-row__cell"> {item?.shortInvoiceId}</td>

      <td className="custom-table-row__cell">{item?.creationDate}</td>

      <td className="custom-table-row__cell">{item?.amount}€</td>

      <td className="custom-table-row__cell custom-table-row__cell--campaign">
        <p title={item?.campaignName}>{item?.campaignName}</p>
        <div className="custom-table-row__row-actions">
          <div className="custom-table-row__action">
            <img src={edit} alt="" />
            <p>Edit</p>
          </div>
          <div
            onClick={() => getPdf(item.invoiceId)}
            className="custom-table-row__action">
            <img src={pdf} alt="" />
            <p>{isRequestingPDF ? "creating..." : "PDF File"}</p>
          </div>
        </div>
      </td>
    </tr>
  );
};
