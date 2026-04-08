import React from "react";
import { Link, useLocation } from "react-router-dom";
import chevron from "@/assets/icons/chevron-right.svg";
import "./pathnames.scss";
import { useUser } from "@/store/get-user";

const HIDDEN_SEGMENTS = ["client", "influencer", "promos"];

const SEGMENT_LABELS: Record<string, string> = {
  "social-accounts": "Social Accounts",
  "account-setting": "Account Setting",
  "edit-password": "Edit Password",
  "campaign-history": "Campaign History",
  "create-invoice": "Create Invoice",
  "invoices-history": "Invoices History",
  "invoice-details": "Invoice Details",
  "payment-details": "Payment Details",
  "contact-support": "Contact Support",
  "new-promos": "New Promos",
  "distributing": "Distributing",
  "completed": "Completed",
  "profile": "Profile",
  "agreement": "Agreement",
  "negotiation": "Negotiation",
};

export const Breadcrumbs: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();

  const dashboardLink = user?.role === "client" ? "/client" : "/influencer";

  // All segments from URL
  const allSegments = location.pathname.split("/").filter(Boolean);

  // Segments to display (filtered)
  const displaySegments = allSegments.filter(
    (segment) => !HIDDEN_SEGMENTS.includes(segment)
  );

  const getBreadcrumbTo = (displayIndex: number) => {
    // Find position of this display segment in full path
    const targetSegment = displaySegments[displayIndex];
    const fullPathIndex = allSegments.indexOf(targetSegment);

    // Build path up to and including this segment
    const path = allSegments.slice(0, fullPathIndex + 1).join("/");
    return `/${path}`;
  };

  return (
    <nav className="breadcrumbs">
      <span>
        <Link to={dashboardLink}>Dashboard</Link>
        {displaySegments.length > 0 && <img src={chevron} alt="" />}
      </span>

      {displaySegments.map((name, index) => {
        const isLast = index === displaySegments.length - 1;
        const label = SEGMENT_LABELS[name] || decodeURIComponent(name.replace(/-/g, " "));
        const to = getBreadcrumbTo(index);

        return isLast ? (
          <span key={to}> {label} </span>
        ) : (
          <span key={to}>
            <Link to={to}>{label}</Link> <img src={chevron} alt="" />
          </span>
        );
      })}
    </nav>
  );
};
