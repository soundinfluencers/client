import { Link } from "react-router-dom";
import { PLACEHOLDER_LOGO_URL } from "@/pages/influencer/shared/utils/socialAccount.mapper";
import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClickOutside } from "@/hooks/global/useClickOutside";
import { useUser } from "@/store/get-user";
import X from "@/assets/icons/x.svg";
import "./_drop-down-nav.scss";
// import { useWindowSize } from '@/hooks/global/useWindowSize';
import { createPortal } from "react-dom";
import { INFLUENCER_NAV_LINKS } from "@components/layout/tab-bar/components/drop-down-nav/influencer-links/influencer-links.data.ts";
import { Client_NAV_LINKS } from "./client-links/client-links.data";

// import type { RefObject } from "react";

interface DropDownNavProps {
  isDropdownOpen: boolean;
  // dropdownRef: RefObject<HTMLDivElement | null>;
  setIsDropdownOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
}

export const DropDownNav = ({
  isDropdownOpen,
  setIsDropdownOpen,
}: DropDownNavProps) => {
  const { logout } = useAuth();
  // const { width } = useWindowSize();
  const { user } = useUser();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (isDropdownOpen) setIsDropdownOpen(false);
  });

  // const AccountSettings =
  //   user?.role === "client"
  //     ? "/client/AccountSetting"
  //     : "/influencer/account-setting";

  // const isDesktop = width > 900;

  // console.log('user in drop down menu', user);
  // console.log('account settings link', AccountSettings);
  const Navlinks =
    user?.role === "client" ? Client_NAV_LINKS : INFLUENCER_NAV_LINKS;

  return createPortal(
    <div
      className={`user-menu ${isDropdownOpen ? "user-menu--open" : ""}`}
      onMouseDown={() => setIsDropdownOpen(false)}>
      <div
        ref={dropdownRef}
        className={`user-menu__dropdown ${isDropdownOpen ? "user-menu__dropdown--open" : ""}`}
        onMouseDown={(e) => e.stopPropagation()}>
        <div className="user-menu__dropdown-header">
          <div className="user-menu__dropdown-header-info">
            <img
              className="user-menu__dropdown-header-info-avatar"
              src={user?.logoUrl ? user.logoUrl : PLACEHOLDER_LOGO_URL}
              alt="User Avatar"
            />
            <p className="user-menu__dropdown-header-info-text">
              {user?.firstName}
            </p>
          </div>
          <img
            src={X}
            alt="Close"
            onClick={() => setIsDropdownOpen(false)}
            className="user-menu__dropdown-header-close"
          />
        </div>

        <nav className="user-menu__dropdown-nav">
          {Navlinks.map((link) => (
            <>
              <Link
                key={link.link}
                className="user-menu__dropdown-nav-link"
                to={link.link}
                onClick={() => setIsDropdownOpen(false)}>
                <img src={link.icon} alt={link.label} />
                {link.label}
              </Link>
              {link.divider && (
                <div className="user-menu__dropdown-nav-divider" />
              )}
            </>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            setIsDropdownOpen(false);
            logout();
          }}
          className="user-menu__dropdown-logout">
          Logout
        </button>
        <Link
          to={"/terms/influencer"}
          className="user-menu__dropdown-terms"
          onClick={() => setIsDropdownOpen(false)}
          target={"_blank"}
          rel="noopener noreferrer">
          Terms and Conditions
        </Link>
      </div>
    </div>,
    document.body,
  );
};
