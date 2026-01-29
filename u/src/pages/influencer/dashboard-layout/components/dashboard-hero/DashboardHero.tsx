import { useMatch } from "react-router-dom";
import { useUser } from "@/store/get-user";
import { HistoryLink } from "../campaign-history-link/HistoryLink";
import { InvoiceLink } from "../create-invoice-link/InvoiceLink";
import { HomePageLink } from "../home-page-link/HomePageLink";
import blackLogo from "../../../../../assets/logos/small-black-logo.svg";

import "./_dashboard-hero.scss";

export const DashboardHero = () => {
  const { user } = useUser();
  const isDashboard = useMatch("/influencer");
  const isPromos = useMatch("/influencer/promos");
  const isHistory = useMatch("/influencer/campaign-history");

  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero__top">
        <div className="dashboard-hero__title-wrapper">
          <h2 className="dashboard-hero__title">
            Welcome back, {user?.firstName}!
          </h2>
        </div>
        <div className="dashboard-hero__right-top">
          {(isPromos || isDashboard) && <HistoryLink />}
          {isHistory && <HomePageLink />}
        </div>
      </div>

      <div className="dashboard-hero__bottom">
        <div className="dashboard-hero__left-bottom">
          <InvoiceLink />
        </div>
        <div className="dashboard-hero__balance">
          <span className="dashboard-hero__balance-label">
            <img src={blackLogo} alt="Black Logo" />
            Balance Due
          </span>
          <span className="dashboard-hero__balance-amount">
            {user?.balance} €
          </span>
        </div>
      </div>
    </section>
  );
};
