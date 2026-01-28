import { Link } from "react-router-dom";

export const STATUS_ACTIONS_MAP: Record<number, React.ReactNode> = {
  0: (
    <Link
      to={"/influencer/promos/new-promos"}
      className="campaign-history-table-row__link">
      Accept/Deny Request
    </Link>
  ),
  1: (
    <Link
      to={"/influencer/promos/distributing"}
      className="campaign-history-table-row__link">
      Post & Submit Insights
    </Link>
  ),
  2: (
    <Link
      to={"/influencer/create-invoice"}
      className="campaign-history-table-row__link">
      Create Invoice
    </Link>
  ),
  3: (
    <span className="campaign-history-table-row__result">Awaiting Payment</span>
  ),
  4: <span className="campaign-history-table-row__result">Completed</span>,
  5: <span className="campaign-history-table-row__result">Denied</span>,
};