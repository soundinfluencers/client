import { FormInput, Edit } from "@/components/ui";
import { useAccountChange } from "@/store/client/account-settings";
import { useFormContext } from "react-hook-form";

export function AccountSettingsForm({ data }: { data: any }) {
  const { isEdit, onChangeEdit } = useAccountChange();

  return (
    <div className="inputs">
      <FormInput
        label="First name"
        name="firstName"
        placeholder={data.firstName}
      />

      <FormInput
        label="Company name"
        name="company"
        placeholder={data.companyName}
      />

      <FormInput label="Phone number" name="phone" placeholder={data.phone} />

      <FormInput label="Email" name="email" placeholder={data.email} />

      <div className="edit-input">
        <FormInput
          label="Password"
          name="password"
          placeholder="********"
          type="password"
        />

        <div className="edit-input__pos">
          <Edit active={isEdit} onChange={onChangeEdit} />
        </div>
      </div>
    </div>
  );
}
export function InvoiceSettingsForm({ data }: { data: any }) {
  return (
    <div className="inputs">
      <FormInput
        label="First name"
        name="firstName"
        placeholder={data.firstName}
      />
      <FormInput
        label="Last name"
        name="lastName"
        placeholder={data.lastName}
      />
      <FormInput label="Address" name="address" placeholder={data.address} />
      <FormInput label="Company" name="company" placeholder={data.company} />
      <FormInput label="Country" name="country" placeholder={data.country} />
      <FormInput
        label="VAT number (only if VAT registered)"
        name="vat"
        placeholder={data.VAT}
      />
    </div>
  );
}
export function ReserPasswordForm() {
  return (
    <div className="inputs">
      <FormInput
        label="Current password"
        name="currentPassword"
        placeholder="Enter current password"
      />
      <p style={{ width: "100%", textAlign: "right" }}>
        Forgot your current password?
      </p>
      <FormInput
        label="New password"
        name="newPassword"
        placeholder="Enter new password"
      />
      <FormInput
        label="Confirm new password"
        name="confirmNewPassword"
        placeholder="Confirm new password"
      />
    </div>
  );
}

export function EmailForm() {
  return (
    <div className="inputs">
      <FormInput label="Email" name="email" placeholder="Enter Email" />
    </div>
  );
}

export function ConfirmForm() {
  return (
    <div className="inputs">
      <FormInput
        label="New password"
        name="newPassword"
        placeholder="Enter new password"
      />
      <FormInput
        label="Confirm new password"
        name="confirmNewPassword"
        placeholder="Confirm new password"
      />
    </div>
  );
}
