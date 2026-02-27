import { type FC, useRef, useState } from "react";
import { Logo } from "./components/logo/Logo.tsx";
import { PLACEHOLDER_LOGO_URL } from '@/pages/influencer/shared/utils/socialAccount.mapper';
// import { LoginButton, SignupButton } from "./components/buttons/Buttons.tsx";
import "./_tab-bar.scss";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "@/hooks/global/useWindowSize.ts";
import burgerMenu from "@/assets/icons/burger-menu.svg";
import { useClickOutside } from "@/hooks/global/useClickOutside.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { Container } from "@/components/container/container.tsx";
import { DropDownNav } from "./components/drop-down-nav/DropDownNav.tsx";
import { useUser } from "@/store/get-user";
import { useLockBodyScroll } from "@/hooks/global/useLockBodyScroll.ts";


export const TabBar: FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { accessToken } = useAuth();
  const { width } = useWindowSize();
  const [isBurgerOpen, setIsBurgerOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const tabBarRef = useRef<HTMLDivElement>(null);

  const isDesktop = width > 900;
  const isOverlayOpen = isBurgerOpen || isDropdownOpen;

  useClickOutside(tabBarRef, () => {
    if (isBurgerOpen) setIsBurgerOpen(false);
  });

  useLockBodyScroll(isOverlayOpen);

  const handleClickBurgerMenu = (path: string) => {
    setIsBurgerOpen(false);
    navigate(path);
  };

  // console.log(user);

  return (
    <div className="tab-bar" ref={tabBarRef}>
      <Container className="tab-bar__content">
        <Logo onClick={() => navigate("/")}/>

        {isDesktop ? (
          <div className="tab-bar__controls-desktop">
            {!accessToken ? (
              <>
                {/* <SignupButton onClick={() => navigate("/signup/client")} /> */}
                {/* <LoginButton onClick={() => navigate("/login")} /> */}
              </>
            ) : (
              <>
                <div
                  className={`tab-bar__user-menu ${isDropdownOpen ? "tab-bar__user-menu--close" : ""}`}
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  tabIndex={0}
                  role="button">
                  {isDesktop && <p className="tab-bar__user-menu-text">Account</p>}
                  <img
                    className="tab-bar__user-menu-avatar"
                    src={user?.logoUrl ? user.logoUrl : PLACEHOLDER_LOGO_URL}
                    alt="User Avatar"
                  />
                </div>
                <DropDownNav
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={setIsDropdownOpen}
                />
              </>
            )}
          </div>
        ) : (
          <div className="tab-bar__controls-mobile">
            {!accessToken ? (
              <>
                <div
                  className="tab-bar__burger-icon"
                  onClick={() => {
                    setIsBurgerOpen((prevState) => !prevState);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img className="tab-bar__burger-toggle" src={burgerMenu} alt=""/>
                </div>
                <div className={`tab-bar__menu ${isBurgerOpen ? "tab-bar__menu--open" : ""}`}>
                  <div
                    className="tab-bar__menu-item tab-bar__menu-item--signup"
                    onClick={() => handleClickBurgerMenu("/signup/client")}
                    role="button"
                    tabIndex={0}
                  >
                    Sign up
                  </div>

                  <div
                    className="tab-bar__menu-item tab-bar__menu-item--login"
                    onClick={() => handleClickBurgerMenu("/login")}
                    role="button"
                    tabIndex={0}
                  >
                    Log in
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className="tab-bar__user-menu"
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  tabIndex={0}
                  role="button">
                  {isDesktop && <p className="tab-bar__user-menu-text">Account</p>}
                  <img
                    className="tab-bar__user-menu-avatar"
                    src={user?.logoUrl ? user.logoUrl : PLACEHOLDER_LOGO_URL}
                    alt="User Avatar"
                  />
                </div>
                <DropDownNav
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={setIsDropdownOpen}
                />
              </>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};
