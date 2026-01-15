import { FormInput, Edit } from "@/components/ui";
import { useAccountChange } from "@/store/client/account-settings";

export function AccountSettingsForm({ data }: { data: any }) {
  const { isEdit, onChangeEdit } = useAccountChange();
  return (
    <>
      <div className="inputs">
        <FormInput
          label="First name"
          name={`${data.firstName}`}
          placeholder={data.firstName}
        />
        <FormInput
          label="Last name"
          name={`${data.lastName}`}
          placeholder={data.lastName}
        />
        <FormInput
          label="Company name"
          name={`${data.company}`}
          placeholder={data.company}
        />
        <FormInput
          label="Phone number"
          name={`${data.phone}`}
          placeholder={data.phone}
        />{" "}
        <FormInput
          label="Email"
          name={`${data.email}`}
          placeholder={data.email}
        />
        <div className="edit-input">
          <FormInput
            label="Password"
            name={`${data.password}`}
            placeholder={"********"}
            type="password"
          />
          <div className="edit-input__pos">
            <Edit active={isEdit} onChange={onChangeEdit} />
          </div>
        </div>
      </div>
    </>
  );
}
export function InvoiceSettingsForm({ data }: { data: any }) {
  return (
    <>
      <div className="inputs">
        <FormInput
          label="First name"
          name={`${data.firstName}`}
          placeholder={data.firstName}
        />
        <FormInput
          label="Last name"
          name={`${data.lastName}`}
          placeholder={data.lastName}
        />
        <FormInput
          label="Address"
          name={`${data.address}`}
          placeholder={data.address}
        />{" "}
        <FormInput
          label="Company"
          name={`${data.company}`}
          placeholder={data.company}
        />
        <FormInput
          label="Country"
          name={`${data.country}`}
          placeholder={data.company}
        />
        <FormInput
          label="VAT number (only if VAT registered)"
          name={`${data.VAT}`}
          placeholder={data.VAT}
        />{" "}
      </div>
    </>
  );
}
export function ReserPasswordForm() {
  return (
    <>
      <div className="inputs">
        <FormInput
          label="Current password"
          name={"Current Password"}
          placeholder={"Enter current password"}
        />
        <p style={{ width: "100%", textAlign: "right" }}>
          Forgot your current password?
        </p>
        <FormInput
          label="New password"
          name={"New password"}
          placeholder={"Enter new password"}
        />{" "}
        <FormInput
          label="Confirm new password"
          name={"Confirm new password"}
          placeholder={"Confirm new password"}
        />
      </div>
    </>
  );
}
export function EmailForm() {
  return (
    <>
      <div className="inputs">
        <FormInput label="Email" name={"Email"} placeholder={"Enter Email"} />
      </div>
    </>
  );
}
export function ConfirmForm() {
  return (
    <>
      <div className="inputs">
        <FormInput
          label="New password"
          name={"newPassword"}
          placeholder={"Enter new password"}
        />{" "}
        <FormInput
          label="Confirm new password"
          name={"Confirm new password"}
          placeholder={"Confirm new password"}
        />
      </div>
    </>
  );
}
