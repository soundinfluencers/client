import React, { useState, useEffect } from "react";

import { useAccountChange } from "@/store/client/account-settings";

import { Breadcrumbs, Container, Loader } from "@/components";

import "./_account-settings.scss";

import { AccountDetailsSection } from "@/client-side/widgets";
import { useProfileDetailsQuery } from "@/client-side/react-query";
import {
  EditPassword
} from "@/pages/influencer/account-setting/components/edit-password-flow/edit-password/EditPassword.tsx";

export const AccountSetting: React.FC = () => {
  const { isEdit, resetAll } = useAccountChange();

  const [accountFlag, setAccountFlag] = useState(false);

  const { data: profile, isLoading } = useProfileDetailsQuery();

  useEffect(() => () => resetAll(), [resetAll]);
  if (isLoading) return <Loader />;

  return (
    <Container className="Account-settings">
      <div className="Account-settings__navigation">
        <Breadcrumbs />
      </div>

      {isEdit ? (
        <div className="Account-settings__content">
          <EditPassword/>
        </div>
      ) : (
        <div className="Account-settings__content">
          <AccountDetailsSection
            profile={profile}
            isEditing={accountFlag}
            toggleEdit={() => setAccountFlag((prev) => !prev)}
          />
          {/* <InvoiceDetailsSection
            invoiceData={invoiceData}
            isEditing={invoiceFlag}
            toggleEdit={() => setInvoiceFlag((prev) => !prev)}
          /> */}
        </div>
      )}
    </Container>
  );
};
