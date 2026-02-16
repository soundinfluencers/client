import React from "react";
import { Link, useLocation } from "react-router-dom";
import chevron from "@/assets/icons/chevron-right.svg";
import "./pathnames.scss";
import { useUser } from "@/store/get-user";

const HIDDEN_SEGMENTS = ["client", "influencer"];

export const Breadcrumbs: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();

  const dashboardLink = user?.role === "client" ? "/client" : "/influencer";

  const pathnames = location.pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => !HIDDEN_SEGMENTS.includes(segment));

  return (
    <nav className="breadcrumbs">
      <span>
        <Link to={dashboardLink}>Dashboard</Link>
        {pathnames.length > 0 && <img src={chevron} alt="" />}
      </span>

      {pathnames.map((name, index) => {
        const isLast = index === pathnames.length - 1;
        const label = decodeURIComponent(name.replace(/-/g, " "));

        return isLast ? (
          <span key={name}> {label} </span>
        ) : (
          <span key={name}>
            {label} <img src={chevron} alt="" />
          </span>
        );
      })}
    </nav>
  );
};
