import { Link } from "react-router-dom";
import { getSocialMediaIcon } from "../../../../../../../../constants/social-medias";
import "./_table-row.scss";
// import type { TSocialMedia } from '../../../../../../../../types/influencer/form/campaign-result/campaign-result.types';
// import type { SocialMediaType } from '../../../../../../../../types/utils/constants.types';

// type CampaignStatus = 'Pending' | 'Distributing' | 'Paid' | 'invoiceSubmitted' | 'insightsSubmitted';

// interface Campaign {
//   campaignName: string;
//   socialMedia: SocialMediaType;
//   dateRequest: string;
//   reward?: number;
//   statusCampaign: CampaignStatus;
// }

interface Props {
  campaign: any; //TODO: Change any to Campaign when real type is available
}

//TODO: Temporary campaign type until real type is available
export const TableRow = ({ campaign }) => {
  return (
    <tr className="campaign-history-table-row">
      <td className="campaign-history-table-row__name">
        <div className="campaign-history-table-row__name-content">
          <img
            src={getSocialMediaIcon(campaign.socialMedia) || ""}
            alt={campaign.socialMedia}
            className="campaign-history-table-row__name-icon"
          />
          {campaign.campaignName}
        </div>
      </td>
      <td className="campaign-history-table-row__date-post">
        {dateFormatter(campaign.dateRequest)}
      </td>
      <td className="campaign-history-table-row__reward">
        {campaign.reward ? `${campaign.reward}€` : "-"}
      </td>
      <td className="campaign-history-table-row__status">
        {normalizeStatus(campaign.statusCampaign)}
      </td>
      <td className="campaign-history-table-row__actions">
        {STATUS_ACTIONS_MAP[campaign.statusCampaign] || (
          <span className="campaign-history-table-item__result">N/A</span>
        )}
      </td>
    </tr>
  );
};
{
  /* <>
  <div className="campaign-history-table-item__name">
    <img
      src={getSocialMediaIcon(campaign.socialMedia) || ''}
      alt={campaign.socialMedia}
      className="campaign-history-table-item__status-icon"
    />
    {campaign.campaignName}
  </div>
  <div className="campaign-history-table-item__date-post">
    {dateFormatter(campaign.dateRequest)}
  </div>
  <div className="campaign-history-table-item__reward">
    {campaign.reward ? `${campaign.reward}€` : '-'}
  </div>
  <div className="campaign-history-table-item__status">{normalizeStatus(campaign.statusCampaign)}</div>
  <div className="campaign-history-table-item__actions">
    {STATUS_ACTIONS_MAP[campaign.statusCampaign] || <span className="campaign-history-table-item__result">N/A</span>}
  </div>
</> */
}

//TODO: Move to utils?
function dateFormatter(dateString: string) {
  //DD.MM.YYYY
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

const normalizeStatus = (status: string) => {
  switch (status) {
    case "Pending":
      return "Pending";
    case "Distributing":
      return "In Distributing";
    case "Paid":
      return "Paid";
    case "invoiceSubmitted":
      return "Invoice Submitted";
    case "insightsSubmitted":
      return "Insights Submitted";
    default:
      return status;
  }
};

const STATUS_ACTIONS_MAP = {
  invoiceSubmitted: (
    <span className="campaign-history-table-row__result">Awaiting Payment</span>
  ),
  Paid: <span className="campaign-history-table-row__result">Completed</span>,
  insightsSubmitted: (
    <Link
      to={"/influencer/create-invoice"}
      className="campaign-history-table-row__link">
      Create Invoice
    </Link>
  ),
  Distributing: (
    <Link
      to={"/influencer/promos/distributing"}
      className="campaign-history-table-row__link">
      Post & Submit Insights
    </Link>
  ),
  Pending: (
    <Link
      to={"/influencer/promos/new-promos"}
      className="campaign-history-table-row__link">
      Accept/Deny Request
    </Link>
  ),
};
