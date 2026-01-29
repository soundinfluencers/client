import React, { useState, useEffect } from "react";

import { useAccountChange } from "@/store/client/account-settings";

import { Breadcrumbs, Container, Loader } from "@/components";

import "./_account-settings.scss";

import { useProfileDetailsQuery } from "./hooks/use-profile-details-query";
import { AccountDetailsSection, EditPasswordFlow } from "./sections";

export const AccountSetting: React.FC = () => {
  const { isEdit, resetAll } = useAccountChange();

  const [accountFlag, setAccountFlag] = useState(false);
  // const [invoiceFlag, setInvoiceFlag] = useState(false);

  const { data: profile, isLoading } = useProfileDetailsQuery();

  // const invoiceData = {
  //   firstName: "No data",
  //   lastName: "No data",
  //   address: "No data",
  //   country: "No data",
  //   company: "No data",
  //   vatNumber: "No data",
  // };
  useEffect(() => () => resetAll(), [resetAll]);
  if (isLoading) return <Loader />;

  return (
    <Container className="Account-settings">
      <div className="Account-settings__navigation">
        <Breadcrumbs />
      </div>
      <div className="Account-settings__title">
        <h2>Account setting</h2>
      </div>

      {isEdit ? (
        <div className="Account-settings__content">
          <EditPasswordFlow />
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
