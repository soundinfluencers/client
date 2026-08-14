import clsx from "clsx";

import Check from '@/assets/icons/check.svg?react';

import s from './bundle-account-list.module.scss';
import { formatCurrency } from "@/pages/influencer/create-bundle/shared/libs/format-currency.ts";
import { formatCompactNumber } from "@/pages/influencer/create-bundle/shared/libs/format-compact-number.ts";
import type { IBundleAccount } from "@/pages/influencer/create-bundle/entities";
import { SOCIAL_MEDIA_ICONS } from "@/pages/influencer/create-bundle/shared/constants/social-media.constants.ts";

interface BundleAccountListProps {
  accounts: IBundleAccount[];
  selectedAccountIds: string[];
  onToggleAccount: (accountId: string) => void;
}

// export const MOCK_BUNDLE_ACCOUNTS: IBundleAccount[] = [
//   {
//     accountId: '1',
//     socialMedia: 'instagram',
//     logoUrl: 'https://i.pravatar.cc/96?img=12',
//     username: '@emma.creates',
//     followers: 128_400,
//     price: 450,
//   },
//   {
//     accountId: '2',
//     socialMedia: 'tiktok',
//     logoUrl: 'https://i.pravatar.cc/96?img=32',
//     username: '@max.on.camera',
//     followers: 856_000,
//     price: 1_200,
//   },
//   {
//     accountId: '3',
//     socialMedia: 'youtube',
//     logoUrl: 'https://i.pravatar.cc/96?img=47',
//     username: '@travelwithmia',
//     followers: 2_340_000,
//     price: 2_800,
//   },
//   {
//     accountId: '4',
//     socialMedia: 'facebook',
//     logoUrl: 'https://i.pravatar.cc/96?img=68',
//     username: '@dailytech',
//     followers: 74_600,
//     price: 320,
//   },
// ];

export const BundleAccountList = ({
  accounts,
  selectedAccountIds,
  onToggleAccount,
}: BundleAccountListProps) => {
  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <h3 className={s.title}>Select accounts</h3>
        <p className={s.subtitle}>(Choose at least 2 accounts to include in your bundle)</p>
      </div>

      <ul className={s.list}>
        {accounts.map((account) => {
          const Icon = SOCIAL_MEDIA_ICONS[account.socialMedia];
          const isSelected = selectedAccountIds.includes(account.accountId);

          return (
            <li
              key={account.accountId}
              className={s.listItem}
            >
              <button
                type="button"
                className={clsx(s.button, {
                  [s.buttonSelected]: isSelected,
                })}
                onClick={() => onToggleAccount(account.accountId)}
                aria-pressed={isSelected}
              >
                <div className={s.mark}>
                 <span
                  aria-hidden="true"
                  className={s.check}
                 >
                   <Check
                    className={clsx(s.icon, {
                     [s.iconVisible]: isSelected,
                    })}
                   />
                  </span>
                </div>
                <div className={s.accountArea}>
                  <span className={s.account}>
                    <img
                      className={s.accountLogo}
                      src={account.logoUrl}
                      width={24}
                      height={24}
                      alt=""
                    />

                    <span className={s.accountName}>
                      {account.username}
                    </span>
                  </span>
                </div>

                <div className={s.statisticsArea}>
                  <span className={s.statistics}>
                    <Icon className={s.platformIcon}/>

                    <span className={s.followers}>
                      {formatCompactNumber(account.followers)} followers
                    </span>
                  </span>
                </div>

                <div className={s.priceArea}>
                  <span className={s.price}>
                    {formatCurrency(account.price)} / post
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
