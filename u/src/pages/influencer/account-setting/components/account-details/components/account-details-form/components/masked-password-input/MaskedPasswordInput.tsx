import { useNavigate } from "react-router-dom";
import { EditButton } from "@components/ui/edit-button/EditButton.tsx";

import './_masked-password-input.scss';

export const MaskedPasswordInput= () => {
  const navigate = useNavigate();

  return (
    <div className="masked-password-input">
      <p
        className="masked-password-input__label"
      >
        Password
      </p>
      <div className="masked-password-input__field">
        <span className="masked-password-input__masked">{`********`}</span>
        <EditButton
          className="masked-password-input__edit-button"
          variants="social"
          onClick={() => navigate('edit-password')}
        />
      </div>
    </div>
  );
}