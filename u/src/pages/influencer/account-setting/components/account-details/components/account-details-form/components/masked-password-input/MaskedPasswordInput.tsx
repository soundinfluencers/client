import { EditButton } from "../../../../../../../../../components/ui/edit-button/EditButton";
import { useAccountSettingsStore } from "../../../../../../store/useAccountSettingsStore";

import './_masked-password-input.scss';

export const MaskedPasswordInput: React.FC = () => {
  const { setMode } = useAccountSettingsStore();

  return (
    <div className="masked-password-input">
      <label
        // htmlFor="masked-password"
        className="masked-password-input__label"
      >
        Password
      </label>
      <div className="masked-password-input__field">
        <span className="masked-password-input__masked">{`********`}</span>
        <EditButton variants="social" onClick={() => setMode("edit-password")} className="masked-password-input__edit-button" />
      </div>
      {/* <input
          id="masked-password"
          className="masked-password-input__input"
          type="text"
          value={``}
          readOnly
        /> */}
    </div>
  );
}