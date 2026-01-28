import { type FC, useRef, useState } from "react";
import { Logo } from "./components/logo/Logo.tsx";
import { LoginButton, SignupButton } from "./components/buttons/Buttons.tsx";
import "./_tab-bar.scss";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "@/hooks/global/useWindowSize.ts";
import burgerMenu from "@/assets/icons/burger-menu.svg";
import { useClickOutside } from "@/hooks/global/useClickOutside.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import React from "react";
import { useUser } from "@/store/get-user/index.ts";
import { Container } from "@/components/container/container.tsx";

export const TabBar: FC = () => {
  const [isBurgerOpen, setIsBurgerOpen] = useState<boolean>(false);
  const { user } = useUser();

  const tabBarRef = useRef<HTMLDivElement>(null);

  const { logout, accessToken } = useAuth();

  const { width } = useWindowSize();
  useClickOutside(tabBarRef, () => {
    if (isBurgerOpen) setIsBurgerOpen(false);
  });

  const navigate = useNavigate();
  const AccountSettings =
    user?.role === "client"
      ? "/client/AccountSetting"
      : "/influencer/account-setting";

  const handleClickBurgerMenu = (path: string) => {
    setIsBurgerOpen(false);
    navigate(path);
  };

  const isDesktop = width > 900;

  return (
    <div className="tab-bar" ref={tabBarRef}>
      <Container className="tab-bar__content">
        {" "}
        <Logo onClick={() => navigate("/")} />
        {isDesktop && (
          <div className="tab-bar__controls-desktop">
            {!accessToken ? (
              <>
                <SignupButton onClick={() => navigate("/signup/client")} />
                <LoginButton onClick={() => navigate("/login")} />
              </>
            ) : (
              <div onClick={() => navigate(AccountSettings)}>
                <p>Account: {user?.firstName}</p>
                {/* <button className="tab-bar__logout" onClick={logout}>
                Logout
              </button> */}
              </div>
            )}
          </div>
        )}
        {!isDesktop && (
          <div
            className="tab-bar__controls-mobile"
            onClick={() => setIsBurgerOpen(true)}>
            <img className="tab-bar__burger-toggle" src={burgerMenu} alt="" />
          </div>
        )}
        <div
          className={`tab-bar__menu ${
            isBurgerOpen ? "tab-bar__menu--open" : ""
          }`}>
          <div
            className="tab-bar__menu-item tab-bar__menu-item--signup"
            onClick={() => handleClickBurgerMenu("/signup/client")}>
            Sign up
          </div>
          <div
            className="tab-bar__menu-item tab-bar__menu-item--login"
            onClick={() => handleClickBurgerMenu("/login")}>
            Log in
          </div>
        </div>
      </Container>
    </div>
  );
};
