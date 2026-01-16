import { Link } from "react-router-dom";
import "./_invoice-link.scss";
import arrowDownRight from "../../../../../assets/icons/arrow-down-right.svg";

export const InvoiceLink = () => {
  return (
    <Link className="invoice-link" to={"create-invoice"}>
      <span className="invoice-link__create">
        Create an Invoice
        <span className="invoice-link__arrow-icon">
          <img src={arrowDownRight} alt="Arrow down right icon" />
        </span>
      </span>
    </Link>
  );
};
