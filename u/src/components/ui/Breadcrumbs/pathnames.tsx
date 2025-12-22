import React from "react";
import { Link, useLocation } from "react-router-dom";
import chevron from "../../../assets/icons/chevron-right.svg";
import "./pathnames.scss";

interface Props {}

// BreadCrumbs using for navigation //

export const Breadcrumbs: React.FC<Props> = () => {
  const location = useLocation();
  const pathnames = location.pathname
    .split("/")
    .filter((segment) => segment && segment !== "client");
    //&& segment !== 'influenser'

  return (
    <nav className="breadcrumbs">
      {pathnames.length > 0 ? (
        <span>
          <Link to="/">Dashboard</Link> <img src={chevron} alt="" />
        </span>
      ) : null}

      {pathnames.map((name, index) => {
        const routeTo = `/client/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <span key={routeTo}>
            {" "}
            {decodeURIComponent(name.replace(/-/g, " "))}{" "}
          </span>
        ) : (
          <span key={routeTo}>
            <Link to={routeTo}>
              {" "}
              {decodeURIComponent(name.replace(/-/g, " "))}{" "}
            </Link>{" "}
            <img src={chevron} alt="" />
          </span>
        );
      })}
    </nav>
  );
};
