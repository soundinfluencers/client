import { MainScreen } from "../influencer/signup-main-screen/MainScreen";
import { AccountDetails } from "../influencer/signup-account-details-form/AccountDetails";
import { useSignupInfluencerStore } from "../../../../../store/features/signupInfluencer";

export const SignupInfluencer = () => {
  const screen = useSignupInfluencerStore(state => state.screen);
  const goToMain = useSignupInfluencerStore(state => state.goToMain);

  if (screen.type === 'platform') {
    return (
      <AccountDetails
        platform={screen.platform}
        mode={screen.mode}
        accountId={screen.accountId}
        goBack={goToMain}
      />
    )
  }

  return (
    <MainScreen />
  )
}