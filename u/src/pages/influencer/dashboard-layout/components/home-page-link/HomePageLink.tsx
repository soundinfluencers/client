import { Link } from "react-router-dom";
import home from "../../../../../assets/icons/home.svg";

import "./_home-page-link.scss";

export const HomePageLink = () => {
  return (
    <Link className="home-page-link" to={"promos"}>
      <span className="home-page-link__content">
        <img src={home} alt="Home icon" />
        Home Page
      </span>
    </Link>
  );
};
