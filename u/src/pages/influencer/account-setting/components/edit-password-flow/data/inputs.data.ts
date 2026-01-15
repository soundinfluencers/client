export const EDIT_PASSWORD_FLOW_INPUTS = {
  editPassword: {
    inputs: [
      {
        type: "password",
        label: "Current password",
        name: "currentPassword",
        placeholder: "Enter current password",
        description: "Forgot your current password?",
      },
      {
        type: "password",
        label: "New password",
        name: "newPassword",
        placeholder: "Enter new password",
      },
      {
        type: "password",
        label: "Confirm new password",
        name: "confirmNewPassword",
        placeholder: "Confirm new password",
      },
    ],
  },
  sendEmail: {
    inputs: [
      {
        type: "email",
        label: "Email",
        name: "email",
        placeholder: "Enter email",
      },
    ],
  },
  newPassword: {
    inputs: [
      {
        type: "password",
        label: "New password",
        name: "newPassword",
        placeholder: "Enter new password",
      },
      {
        type: "password",
        label: "Confirm new password",
        name: "confirmNewPassword",
        placeholder: "Confirm new password",
      },
    ],
  },
};