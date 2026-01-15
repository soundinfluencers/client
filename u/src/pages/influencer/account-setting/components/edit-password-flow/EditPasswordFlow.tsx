import { useAccountSettingsStore } from "../../store/useAccountSettingsStore";
import { EditPassword } from "./edit-password/EditPassword";
import { NewPassword } from "./new-password/NewPassword";
import { SendEmail } from "./send-email/SendEmail";

export const EditPasswordFlow: React.FC = () => {
  const { mode } = useAccountSettingsStore();

  if (mode === "send-email") {
    return <SendEmail />;
  }

  if (mode === "new-password") {
    return <NewPassword />;
  }

  return <EditPassword />;
};