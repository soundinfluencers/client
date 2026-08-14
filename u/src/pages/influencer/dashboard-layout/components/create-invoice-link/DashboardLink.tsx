import { Link } from "react-router-dom";
import "./_invoice-link.scss";
import arrowDownRight from "../../../../../assets/icons/arrow-down-right.svg";

interface DashboardLinkProps {
  href: string;
  label: string;
}

export const DashboardLink = ({
  href,
  label,
}: DashboardLinkProps) => {

  return (
    <Link className="invoice-link" to={href}>
      <span className="invoice-link__create">
        {label}
        <span className="invoice-link__arrow-icon">
          <img src={arrowDownRight} alt="Arrow down right icon" />
        </span>
      </span>
    </Link>
  );
};
