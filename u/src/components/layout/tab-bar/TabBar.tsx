import { type FC, useRef, useState } from "react";
import { Logo } from "./components/logo/Logo.tsx";
import { LoginButton, SignupButton } from "./components/buttons/Buttons.tsx";
import "./_tab-bar.scss";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "@/hooks/global/useWindowSize.ts";
import burgerMenu from "@/assets/icons/burger-menu.svg";
import { useClickOutside } from "@/hooks/global/useClickOutside.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { Container } from "@/components/container/container.tsx";
import { DropDownNav } from "./components/drop-down-nav/DropDownNav.tsx";


export const TabBar: FC = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { width } = useWindowSize();
  const [isBurgerOpen, setIsBurgerOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const tabBarRef = useRef<HTMLDivElement>(null);

  useClickOutside(tabBarRef, () => {
    if (isBurgerOpen) setIsBurgerOpen(false);
  });

  const handleClickBurgerMenu = (path: string) => {
    setIsBurgerOpen(false);
    navigate(path);
  };

  const isDesktop = width > 900;

  return (
    <div className="tab-bar" ref={tabBarRef}>
      <Container className="tab-bar__content">
        <Logo onClick={() => navigate("/")} />

        {isDesktop ? (
          <div className="tab-bar__controls-desktop">
            {!accessToken ? (
              <>
                {/* <SignupButton onClick={() => navigate("/signup/client")} /> */}
                {/* <LoginButton onClick={() => navigate("/login")} /> */}
              </>
            ) : (
              <DropDownNav isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen} />
            )}
          </div>
        ) : (
          <div className="tab-bar__controls-mobile">
            <div
              onClick={() => {
                setIsBurgerOpen(true);
                setIsDropdownOpen(true);
              }}
              role="button"
              tabIndex={0}>
              <img className="tab-bar__burger-toggle" src={burgerMenu} alt="" />
            </div>
            {!accessToken ? (
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
            ) : (
              <DropDownNav isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen} />
            )}
          </div>
        )}
      </Container>
    </div>
  );
};
