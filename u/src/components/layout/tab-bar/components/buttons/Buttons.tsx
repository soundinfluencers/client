import type {FC} from "react";

export interface TabBarAuthButtonsProps {
    onClick: () => void;
}

export const LoginButton: FC<TabBarAuthButtonsProps> = ({ onClick }: TabBarAuthButtonsProps) => {
    return (
        <div className="tab-bar__button tab-bar__button--login" onClick={onClick}>
            Log in
        </div>
    )
}

export const SignupButton: FC<TabBarAuthButtonsProps> = ({ onClick }: TabBarAuthButtonsProps) => {
    return (
        <div className="tab-bar__button tab-bar__button--signup" onClick={onClick}>
            Sign up
        </div>
    )
}