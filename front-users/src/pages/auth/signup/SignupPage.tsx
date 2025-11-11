import {type FC} from "react";
import type {UserRoleType} from "../../../types/user/user.types.ts";
import {SignupClient} from "./layout/SignupClient.tsx";

export interface SignupPageProps {
    userRole: UserRoleType;
}

export const SignupPage: FC<SignupPageProps> = ({ userRole = 'client' }: SignupPageProps) => {
    return (
        <div className="signup-page">
            <SignupClient/>
        </div>
    )
}