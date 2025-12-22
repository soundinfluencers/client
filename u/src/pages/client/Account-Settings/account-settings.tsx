import React, { useState, useEffect } from "react";
import { useClientUser } from "../../../store/get-user-client";
import { useAccountChange } from "../../../store/client/account-settings";
import { EditPasswordFlow } from "./sections/edit-field";

import "./_account-settings.scss";
import { Breadcrumbs, Container } from "../../../components";
import { AccountDetailsSection, InvoiceDetailsSection } from "./sections";
export const AccountSetting: React.FC = () => {
  const { user } = useClientUser();
  const { isEdit, resetAll } = useAccountChange();

  const [accountFlag, setAccountFlag] = useState(false);
  const [invoiceFlag, setInvoiceFlag] = useState(false);

  const invoiceData = {
    firstName: "No data",
    lastName: "No data",
    address: "No data",
    country: "No data",
    company: "No data",
    vatNumber: "No data",
  };

  useEffect(() => {
    return () => resetAll();
  }, [resetAll]);

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
            user={user}
            isEditing={accountFlag}
            toggleEdit={() => setAccountFlag((prev) => !prev)}
          />
          <InvoiceDetailsSection
            invoiceData={invoiceData}
            isEditing={invoiceFlag}
            toggleEdit={() => setInvoiceFlag((prev) => !prev)}
          />
        </div>
      )}
    </Container>
  );
};
