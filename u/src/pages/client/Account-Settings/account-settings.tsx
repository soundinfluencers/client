import React from "react";
import { Container } from "../../../components/container/container";
import { Breadcrumbs } from "../../../components/ui/Breadcrumbs/pathnames";
import { Edit } from "../../../components/ui/edit/edit";
import "./_account-settings.scss";
import { FillData } from "./fill-data/fill-data";
import { useClientUser } from "../../../store/get-user-client";
import {
  invoiceFields,
  userFields,
} from "../../../constants/account-settings-data";
import Form from "../../../components/form/form";
interface Props {}

export const AccountSetting: React.FC<Props> = () => {
  const { user } = useClientUser();

  const [formData, setFormData] = React.useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "lastName",
    company: user?.company || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [formInvoiceData, setformInvoiceData] = React.useState({
    firstName: "1",
    lastName: "2",
    address: "3",
    country: "4",
    company: "5",
    VAT: "6",
  });

  const [accountFlag, setAccountFlag] = React.useState<boolean>(false);
  const [invoiceFlag, setInvoiceFlag] = React.useState<boolean>(false);
  const AccountChange = () => {
    setAccountFlag((prev) => !prev);
  };
  const InvoiceChange = () => {
    setInvoiceFlag((prev) => !prev);
  };
  const invoiceData = {
    firstName: "No data",
    lastName: "No data",
    address: "No data",
    country: "No data",
    company: "No data",
    vatNumber: "No data",
  };
  return (
    <Container className="Account-settings">
      <div className="Account-settings__navigation">
        <Breadcrumbs />
      </div>
      <div className="Account-settings__title">
        <h2>Account setting</h2>
      </div>
      <div className="Account-settings__content">
        {" "}
        <div className="Account-settings__details">
          <div className="Account-settings__subtitle">
            <h3>Account details</h3>
            <Edit active={accountFlag} onChange={AccountChange} />
          </div>
          {accountFlag ? (
            <Form accountSettings={formData}></Form>
          ) : (
            <FillData data={user || {}} fields={userFields} />
          )}
        </div>
        <div className="Account-settings__invoice">
          <div className="Account-settings__subtitle">
            <h3>Invoice details</h3>
            <Edit active={invoiceFlag} onChange={InvoiceChange} />
          </div>
          {invoiceFlag ? (
            <Form invoiceSettings={formInvoiceData}></Form>
          ) : (
            <FillData data={invoiceData} fields={invoiceFields} />
          )}
        </div>
      </div>
    </Container>
  );
};
