import type {UserRoleType} from "../user/user.types.ts";

export interface RequestLoginUserModel {
    email: string;
    password: string;
}

export interface ResponseLoginUserModel {
    accessToken: string | null;
    userRole: UserRoleType | null;
}