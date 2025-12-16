import type React from "react";

import './_account-switcher.scss';
import type { IAccountFormValues } from "../../../../../../../../types/user/influencer.types";
import { Controller, type Control } from "react-hook-form";

interface Props {
  control: Control<IAccountFormValues>;
}

export const AccountSwitcher: React.FC<Props> = ({ control }) => {
  return (
    <div className="account-switcher">
      <p className="account-switcher__title">Choose your account type</p>

      <Controller
        name="profileCategory"
        control={control}
        render={({ field }) => (
          <div
            className={`account-switcher__switchers`}
          >
            <div className="account-switcher__action">
              <button
                type="button"
                className={`account-switcher__action-btn ${field.value === 'community' ? 'account-switcher__action-btn--active' : ''}`}
                onClick={() => field.onChange('community')}
              >
                Community
              </button>
              <p>Pages that share or repost content</p>
            </div>

            <div className="account-switcher__action">
              <button
                type="button"
                className={`account-switcher__action-btn ${field.value === 'creator' ? 'account-switcher__action-btn--active' : ''}`}
                onClick={() => field.onChange('creator')}
              >
                Creator
              </button>
              <p>Individual influencer, artist, or performer</p>
            </div>
          </div>
        )}
      />
    </div>
  );
};
