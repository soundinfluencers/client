import { type FC, useRef, useState } from "react";
import { Logo } from "./components/logo/Logo.tsx";
import { LoginButton, SignupButton } from "./components/buttons/Buttons.tsx";
import "./_tab-bar.scss";
import { Link, useNavigate } from "react-router-dom";
import { useWindowSize } from "@/hooks/useWindowSize.ts";
import burgerMenu from "@/assets/icons/burger-menu.svg";
import { useClickOutside } from "@/hooks/useClickOutside.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import React from "react";
import { useUser } from "@/store/get-user/index.ts";
import { Container } from "@/components/container/container.tsx";
import { PLACEHOLDER_LOGO_URL } from "@/pages/influencer/shared/utils/socialAccount.mapper.ts";
import X from "@/assets/icons/x.svg";

export const TabBar: FC = () => {
  const [isBurgerOpen, setIsBurgerOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { user } = useUser();

  const tabBarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { logout, accessToken } = useAuth();

  const { width } = useWindowSize();

  useClickOutside(tabBarRef, () => {
    if (isBurgerOpen) setIsBurgerOpen(false);
  });

  useClickOutside(dropdownRef, () => {
    if (isDropdownOpen) setIsDropdownOpen(false);
  });

  const navigate = useNavigate();
  const AccountSettings =
    user?.role === "client"
      ? "/client/AccountSettigns"
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
                {/* <SignupButton onClick={() => navigate("/signup/client")} /> */}
                {/* <LoginButton onClick={() => navigate("/login")} /> */}
              </>
            ) : (
              <div className="tab-bar__user-menu">
                <div
                  className="tab-bar__user-menu-item"
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  tabIndex={0}
                  role="button"
                >
                  <p className="tab-bar__user-menu-item-text">Account</p>
                  <img
                    className="tab-bar__user-menu-item-avatar"
                    src={PLACEHOLDER_LOGO_URL}
                    alt="User Avatar"
                  />
                </div>

                {isDropdownOpen && (
                  <div
                    className="tab-bar__dropdown-overlay"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                )}

                <div
                  ref={dropdownRef}
                  className={`tab-bar__user-menu-dropdown ${isDropdownOpen ? "tab-bar__user-menu-dropdown--open" : ""}`}
                >
                  <div className="tab-bar__user-menu-dropdown-header">
                    <div className="tab-bar__user-menu-dropdown-header-info">
                      <img
                        className="tab-bar__user-menu-item-avatar"
                        src={PLACEHOLDER_LOGO_URL}
                        alt="User Avatar"
                      />
                      <p className="tab-bar__user-menu-item-text">Account</p>
                    </div>

                    <img
                      src={X}
                      alt="Close"
                      onClick={() => setIsDropdownOpen(false)}
                      className="tab-bar__user-menu-dropdown-header-close"
                    />
                  </div>

                  <nav className="tab-bar__user-menu-dropdown-nav">
                    <Link
                      className="tab-bar__user-menu-dropdown-nav-link"
                      to={AccountSettings}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Account settings
                    </Link>

                    <Link
                      className="tab-bar__user-menu-dropdown-nav-link"
                      to="/influencer/invoices"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Invoice details
                    </Link>

                    <Link
                      className="tab-bar__user-menu-dropdown-nav-link"
                      to=""
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Contact support
                    </Link>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="tab-bar__user-menu-dropdown-logout"
                    >
                      Logout
                    </button>
                  </nav>
                </div>
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
          className={`tab-bar__menu ${isBurgerOpen ? "tab-bar__menu--open" : ""
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
