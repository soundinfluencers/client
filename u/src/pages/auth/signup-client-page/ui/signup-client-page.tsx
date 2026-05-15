import { useSignUpClientDraftStore } from "@/features/auth/sign-up-client/model/sign-up-client.store.ts";

import { SignUpClientForm } from "@/features/auth/sign-up-client/ui/sign-up-client-form.tsx";
import { Link } from "react-router-dom";

import s from './signup-client-page.module.scss';

export const SignupClientPage = () => {
  const personalDetails = useSignUpClientDraftStore((state) => state.personalDetails);
  const setPersonalDetails = useSignUpClientDraftStore((state) => state.setPersonalDetails);
  const hasHydrated = useSignUpClientDraftStore(
    (state) => state._hasHydrated,
  );

  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  return (
    <div className={s.signupClientPage}>
      <div className={s.title}>
        <h2>Add your details here</h2>
        <p>to get approved as a Sponsoring Client</p>
      </div>


      <div className={s.content}>

        <SignUpClientForm defaultFormValues={personalDetails} onDraftSave={setPersonalDetails}/>

        <p className={s.terms}>
          By clicking Apply now, you confirm and approve the rates listed above and agree to our{'\n'}
          <Link
            className={s.termsLink}
            to={'/terms/client'}
            target={"_blank"}
            rel="noopener noreferrer"
          >
            Terms & Conditions.
          </Link>
        </p>
      </div>
    </div>
  );
};
