import React from "react";
import { Link, useLocation } from "react-router-dom";
import chevron from "@/assets/icons/chevron-right.svg";
import "./pathnames.scss";

interface Props {}

// BreadCrumbs using for navigation //

export const Breadcrumbs: React.FC<Props> = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

    console.log(pathnames);

  return (
    <nav className="breadcrumbs">

      <span>
        <Link to="/">Dashboard</Link> <img src={chevron} alt="" />
      </span>

      {pathnames.map((name, index) => {
        // const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <span> {decodeURIComponent(name.replace(/-/g, " "))} </span>
        ) : (
          <span>
            {decodeURIComponent(name.replace(/-/g, " "))}{" "}
            <img src={chevron} alt="" />
          </span>
        );
      })}
    </nav>
  );
};
