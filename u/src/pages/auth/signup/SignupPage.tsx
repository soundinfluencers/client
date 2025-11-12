import {type FC} from "react";
import {SignupClient} from "./components/layout/SignupClient.tsx";

export const SignupPage: FC = () => {
    return (
        <div className="signup-page">
            <SignupClient/>
        </div>
    )
}