import settingsIcon from '../../../../../../assets/nav-bar/settings.svg';
import socialAccountsIcon from '../../../../../../assets/nav-bar/user-check.svg';
import invoicesHistoryIcon from '../../../../../../assets/nav-bar/clock.svg';
import invoiceDetailsIcon from '../../../../../../assets/nav-bar/trending-up.svg';
import paymentDetailsIcon from '../../../../../../assets/nav-bar/file-text.svg';
import contactSupportIcon from '../../../../../../assets/nav-bar/globe.svg';

interface InfluencerNavLink {
  icon: string;
  label: string;
  link: string;
  divider?: boolean;
}

export const INFLUENCER_NAV_LINKS: InfluencerNavLink[] = [
  {
    icon: settingsIcon,
    label: "Account settings",
    link: '/influencer/account-setting',
  },
  {
    icon: socialAccountsIcon,
    label: "Social accounts",
    link: '/influencer/social-accounts',
    divider: true,
  },
  {
    icon: invoicesHistoryIcon,
    label: "Invoices history",
    link: '/influencer/invoices-history',
  },
  {
    icon: invoiceDetailsIcon,
    label: "Invoice details",
    link: '/influencer/invoice-details',
  },
  {
    icon: paymentDetailsIcon,
    label: "Payment details",
    link: '/influencer/payment-details',
    divider: true,
  },
  {
    icon: contactSupportIcon,
    label: "Contact support",
    link: '/influencer/contact-support',
  },
  {
    icon: settingsIcon,
    label: "Example link",
    link: '/influencer/agreement',
  },
];
