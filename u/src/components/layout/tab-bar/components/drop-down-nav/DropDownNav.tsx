import { Link } from 'react-router-dom';
import { PLACEHOLDER_LOGO_URL } from '@/pages/influencer/shared/utils/socialAccount.mapper';
import { useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClickOutside } from '@/hooks/global/useClickOutside';
import { useUser } from '@/store/get-user';
import X from "@/assets/icons/x.svg";
import './_drop-down-nav.scss';
import { useWindowSize } from '@/hooks/global/useWindowSize';

interface DropDownNavProps {
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
}

export const DropDownNav = ({ isDropdownOpen, setIsDropdownOpen }: DropDownNavProps) => {
  const { logout } = useAuth();
  const { width } = useWindowSize();
  const { user } = useUser();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (isDropdownOpen) setIsDropdownOpen(false);
  });

  const AccountSettings =
    user?.role === "client"
      ? "/client/AccountSetting"
      : "/influencer/account-setting";

  const isDesktop = width > 900;

  // console.log('user in drop down menu', user);
  // console.log('account settings link', AccountSettings);

  return (
    <div className="user-menu">
      {isDesktop && (
        <div
          className="user-menu__item"
          onClick={() => setIsDropdownOpen((v) => !v)}
          tabIndex={0}
          role="button"
        >
          <p className="user-menu__item-text">Account</p>
          <img
            className="user-menu__item-avatar"
            src={PLACEHOLDER_LOGO_URL}
            alt="User Avatar"
          />
        </div>
      )}

      <div
        ref={dropdownRef}
        className={`user-menu__dropdown ${isDropdownOpen ? "user-menu__dropdown--open" : ""
          }`}
      >
        <div className="user-menu__dropdown-header">
          <div className="user-menu__dropdown-header-info">
            <img
              className="user-menu__dropdown-header-info-avatar"
              src={PLACEHOLDER_LOGO_URL}
              alt="User Avatar"
            />
            <p className="user-menu__dropdown-header-info-text">Account</p>
          </div>

          <img
            src={X}
            alt="Close"
            onClick={() => setIsDropdownOpen(false)}
            className="user-menu__dropdown-header-close"
          />
        </div>

        <nav className="user-menu__dropdown-nav">
          <Link
            className="user-menu__dropdown-nav-link"
            to={AccountSettings}
            onClick={() => setIsDropdownOpen(false)}
          >
            Account settings
          </Link>

          <Link
            className="user-menu__dropdown-nav-link"
            to="/influencer/invoices"
            onClick={() => setIsDropdownOpen(false)}
          >
            Invoice details
          </Link>

          <Link
            className="user-menu__dropdown-nav-link"
            to=""
            onClick={() => setIsDropdownOpen(false)}
          >
            Contact support
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen(false);
              logout();
            }}
            className="user-menu__dropdown-logout"
          >
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};