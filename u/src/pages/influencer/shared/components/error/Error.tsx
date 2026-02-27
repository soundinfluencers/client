import { Container } from "@/components";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import serviceIcon from "@/assets/empty-list/services.svg";

import './_error.scss';

export const Error = () => {
  return (
    <Container className="error">
      <img
        className={'error__img'}
        src={serviceIcon}
        alt="Service error"
        loading="lazy"
      />

      <div className="error__content">
        <div className={"error__info"}>
          <h1 className="error__title">Service temporarily unavailable</h1>
          <p className="error__description">We’re performing technical maintenance. Please check back shortly.</p>
        </div>

        <ButtonMain
          label={"Notify me when it’s back"}
          onClick={() => alert("You will be notified when the service is back.")}

        />
      </div>

    </Container>
  );
};
