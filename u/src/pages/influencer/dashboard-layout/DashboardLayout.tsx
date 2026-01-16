import { useDashboardLayoutStore } from "./store/useDashboardLayoutStore";
import { Container } from "../../../components";
import { HistoryLink } from "./components/campaign-history-link/HistoryLink";
import { InvoiceLink } from "./components/create-invoice-link/InvoiceLink";
import { DashboardHero } from "./components/dashboard-hero/DashboardHero";
import { PromosFiltersBar } from "./components/promo-filters-bar/PromosFiltersBar";
import { ViewModeTabs } from "./components/promos-view-mode-tab/ViewModeTabs";
import { Outlet, useMatch } from "react-router-dom";
import { HomePageLink } from "./components/home-page-link/HomePageLink";

import "./_dashboard-layout.scss";
import { fetchProfileDetails } from "@/api/profile-details/profile-details-fetch";
import React from "react";
import { useProfileDetails } from "@/store/profile-details/useProfile-details";

export const DashboardLayout = () => {
  const isDashboard = useMatch("/influencer");
  const isPromos = useMatch("/influencer/promos");
  const isHistory = useMatch("/influencer/campaign-history");
  const { profile, setProfile } = useProfileDetails();

  const profileMode = profile?.role === "client";

  const { viewMode, setViewMode } = useDashboardLayoutStore();

  const fetch = async () => {
    try {
      const data = await fetchProfileDetails("influencer");
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  console.log(profile, "profile");

  React.useEffect(() => {
    fetch();
  }, []);
  return (
    <>
      <Container className="dashboard">
        <div className="dashboard__hero-wrapper">
          <DashboardHero />

          <div className="dashboard__hero-links">
            {(isPromos || isDashboard) && <HistoryLink />}
            {isHistory && <HomePageLink />}
            <InvoiceLink />
          </div>
        </div>
        <div className="dashboard__top-bar">
          <h3 className="dashboard__top-bar-title">Promos</h3>
          <div className="dashboard__top-bar-actions">
            <PromosFiltersBar />
            {(isPromos || isDashboard) && (
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
            )}
          </div>
        </div>
      </Container>

      <Outlet />
    </>
  );
};
