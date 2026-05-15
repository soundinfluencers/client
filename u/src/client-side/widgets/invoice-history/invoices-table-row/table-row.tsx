import { getPdffileInvoiceHistory } from "@/api/client/invoice/invoice.api";
import "./_table-row.scss";
import pdf from "@/assets/icons/iwwa_file-pdf.svg";
import edit from "@/assets/icons/edit.svg";
import { toast } from "react-toastify";
import React from "react";
import { EditInvoiceModal } from "./pop-up.tsx";
import {CircleLoader} from "@/features/auth/sign-up-client/ui/circle-loader";

interface Props {
  item: any;
  onReload?: () => void;
}

export const TableRow = ({ item, onReload }: Props) => {
  const [isRequestingPDF, setisRequestingPDF] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

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
    if (isRequestingPDF) return;

    try {
      setisRequestingPDF(true);

      const blob = await getPdffileInvoiceHistory(id);

      downloadBlob(blob, `invoice-${id}.pdf`);
      toast.success("PDF created successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create PDF");
    } finally {
      setisRequestingPDF(false);
    }
  };

  return (
      <>
        <tr className="custom-table-row">
          <td className="custom-table-row__cell">{item?.shortInvoiceId}</td>

          <td className="custom-table-row__cell">{item?.creationDate}</td>

          <td className="custom-table-row__cell">
            {item?.amount} {item?.amount ? "€" : ""}
          </td>

          <td className="custom-table-row__cell custom-table-row__cell--campaign">
            <p title={item?.campaignName}>{item?.campaignName}</p>

            {item?.shortInvoiceId && (
                <div className="custom-table-row__row-actions">
                  <div
                      className="custom-table-row__action"
                      onClick={() => setIsEditOpen(true)}
                  >
                    <img src={edit} alt="" />
                    <p>Edit</p>
                  </div>

                  <div
                      onClick={() => getPdf(item.invoiceId)}
                      className={`custom-table-row__action ${
                          isRequestingPDF ? "custom-table-row__action--loading" : ""
                      }`}
                  >
                    {isRequestingPDF ? (
                        <CircleLoader />
                    ) : (
                        <img src={pdf} alt="" />
                    )}

                    <p>{isRequestingPDF ? "Creating..." : "PDF File"}</p>
                  </div>
                </div>
            )}
          </td>
        </tr>

        {isEditOpen && (
            <EditInvoiceModal
                invoiceId={item.invoiceId}
                onClose={() => setIsEditOpen(false)}
                onSaved={onReload}
            />
        )}
      </>
  );
};