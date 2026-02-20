import './_edit-password-form-content.scss';
import { BaseMaskedPasswordInput } from "@components/ui/base-masked-password-input/BaseMaskedPasswordInput.tsx";
import { useMutation } from "@tanstack/react-query";
import { updatePasswordApi } from "@/api/auth/auth.api";
import { toast } from "react-toastify";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { useFormContext } from "react-hook-form";
import type {
  ChangePasswordValues
} from "@/pages/influencer/account-setting/components/edit-password-flow/edit-password/validation/schema.ts";

export const EditPasswordFormContent = () => {
  const { handleSubmit, resetField } = useFormContext<ChangePasswordValues>();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => updatePasswordApi(currentPassword, newPassword),

    onSuccess: () => {
      toast.success("Password updated successfully!");
      resetField("currentPassword");
      resetField("newPassword");
      resetField("confirmNewPassword");
    },
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    const { currentPassword, newPassword } = data;
    await mutateAsync({ currentPassword, newPassword });
  }

  return (
    <>
      <div className="edit-password-form-content">
        <BaseMaskedPasswordInput<ChangePasswordValues>
          name={"currentPassword"}
          label={"Current password"}
          placeholder={"Enter current password"}
          autoComplete={"current-password"}
        />
        <BaseMaskedPasswordInput<ChangePasswordValues>
          name={"newPassword"}
          label={"New password"}
          placeholder={"Enter new password"}
          autoComplete={"new-password"}
        />
        <BaseMaskedPasswordInput<ChangePasswordValues>
          name={"confirmNewPassword"}
          label={"Confirm new password"}
          placeholder={"Confirm new password"}
          autoComplete={"new-password"}
        />
      </div>

      <div className="edit-password-form-content__submit">
        <ButtonMain
          type="submit"
          label={isPending ? 'Submitting...' : 'Submit'}
          isDisabled={isPending}
          onClick={handleSubmit(onSubmit)}
        />
      </div>
    </>
  );
};