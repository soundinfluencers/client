import React from "react";
import "./_home-header.scss";

import arrowIcon from "@/assets/icons/arrow-down-right.svg";
import logoIcon from "@/assets/logos/small-black-logo.svg";
import { useWindowSize } from "@/hooks/global/useWindowSize";
import { useNavigate } from "react-router-dom";

export interface HomeHeaderProps {
  firstName?: string;
  balance?: number;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  firstName,
  balance,
}) => {
  const { width } = useWindowSize();
  const navigate = useNavigate();
  return width > 812 ? (
    <div className="home-header">
      <div className="home-header__left">
        <div className="home-header__greeting">
          {firstName ? <p>Welcome back, {firstName}!</p> : <p>Welcome back!</p>}
        </div>
        <div className="home-header__row">
          {" "}
          <div
            onClick={() => navigate("/client/CreateCampaign")}
            className="home-header__create-wrapper">
            <div className="home-header__create">
              <p>Create a campaign</p>

              <div className="home-header__create-img">
                <img src={arrowIcon} alt="" />
              </div>
            </div>
          </div>{" "}
          <div
            onClick={() => navigate("/client/BespokeCampaign")}
            className="home-header__create-wrapper">
            <div className="home-header__create">
              <p>Bespoke Campaign </p>

              <div className="home-header__create-img">
                <img src={arrowIcon} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="home-header__right">
        <div className="home-header__right-top"></div>

        <div className="home-header__right-bottom">
          <div className="home-header__balance-block">
            <div className="home-header__balance-title">
              <img src={logoIcon} alt="" />
              <p>Balance</p>
            </div>

            <div className="home-header__balance-content">
              <p>{balance}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="home-header-mobile">
      <div className="home-header-mobile__rectangle">
        <div className="home-header-mobile__greeting">
          {firstName ? <p>Welcome back, {firstName}!</p> : <p>Welcome back!</p>}
        </div>

        <div className="home-header__balance-block">
          <div className="home-header__balance-title">
            <img src={logoIcon} alt="" />
            <p>Balance</p>
          </div>

          <div className="home-header__balance-content">
            <p>{balance}</p>
          </div>
        </div>
      </div>
      <div className="home-header-mobile__row">
        {" "}
        <div
          onClick={() => navigate("/client/CreateCampaign")}
          className="home-header__create-wrapper">
          <div className="home-header__create">
            <p>Create a campaign</p>

            <div className="home-header__create-img">
              <img src={arrowIcon} alt="" />
            </div>
          </div>
        </div>
        <div
          onClick={() => navigate("/client/BespokeCampaign")}
          className="home-header__create-wrapper">
          <div className="home-header__create">
            <p>Bespoke Campaign </p>

            <div className="home-header__create-img">
              <img src={arrowIcon} alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
