import React from "react";
import { Link, useLocation } from "react-router-dom";
import chevron from "@/assets/icons/chevron-right.svg";
import "./pathnames.scss";
import { useUser } from "@/store/get-user";

const HIDDEN_SEGMENTS = ["client", "influencer"];

const formatLabel = (segment: string) => {
    const decoded = decodeURIComponent(segment).replace(/-/g, " ");
    return decoded.charAt(0).toUpperCase() + decoded.slice(1);
};

export const Breadcrumbs: React.FC = () => {
    const { user } = useUser();
    const location = useLocation();

    const dashboardLink = user?.role === "client" ? "/client" : "/influencer";

    const visibleSegments = location.pathname
        .split("/")
        .filter(Boolean)
        .filter((segment) => !HIDDEN_SEGMENTS.includes(segment));

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
      <span className="breadcrumbs__item">
        <Link to={dashboardLink}>Dashboard</Link>
          {visibleSegments.length > 0 && <img src={chevron} alt="" />}
      </span>

            {visibleSegments.map((segment, index) => {
                const isLast = index === visibleSegments.length - 1;

                const href =
                    "/" +
                    [
                        user?.role === "client" ? "client" : "influencer",
                        ...visibleSegments.slice(0, index + 1),
                    ].join("/");

                const label = formatLabel(segment);

                return (
                    <span key={`${segment}-${index}`} className="breadcrumbs__item">
            {isLast ? (
                <span className="breadcrumbs__current">{label}</span>
            ) : (
                <>
                    <Link to={href}>{label}</Link>
                    <img src={chevron} alt="" />
                </>
            )}
          </span>
                );
            })}
        </nav>
    );
};