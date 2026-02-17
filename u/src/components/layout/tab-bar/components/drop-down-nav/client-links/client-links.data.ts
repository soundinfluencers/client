import settingsIcon from "../../../../../../assets/nav-bar/settings.svg";
import socialAccountsIcon from "../../../../../../assets/nav-bar/user-check.svg";
import invoicesHistoryIcon from "../../../../../../assets/nav-bar/clock.svg";
import invoiceDetailsIcon from "../../../../../../assets/nav-bar/trending-up.svg";
import paymentDetailsIcon from "../../../../../../assets/nav-bar/file-text.svg";
import contactSupportIcon from "../../../../../../assets/nav-bar/globe.svg";

interface ClientNavLink {
  icon: string;
  label: string;
  link: string;
  divider?: boolean;
}

export const Client_NAV_LINKS: ClientNavLink[] = [
  {
    icon: settingsIcon,
    label: "Account settings",
    link: "/client/account-settings",
    divider: true,
  },
  {
    icon: invoicesHistoryIcon,
    label: "Invoices history",
    link: "/client/invoice-history",
  },
  {
    icon: invoiceDetailsIcon,
    label: "Invoice details",
    link: "/client/invoice-details",
    divider: true,
  },
  {
    icon: contactSupportIcon,
    label: "Contact support",
    link: "/client/contact-support",
  },
];
