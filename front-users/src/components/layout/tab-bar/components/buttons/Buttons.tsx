import type {FC} from "react";

export const LoginButton: FC = () => {
    return (
        <div className="tab-bar__button tab-bar__button--login">
            Log in
        </div>
    )
}

export const SignupButton: FC = () => {
    return (
        <div className="tab-bar__button tab-bar__button--signup">
            Sign up
        </div>
    )
}