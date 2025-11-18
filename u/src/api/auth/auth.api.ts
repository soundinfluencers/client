import type {RequestLoginUserModel} from "../../types/auth/auth.types.ts";
import $api from "../api.ts";

export const loginApi = async ({email, password}: RequestLoginUserModel) => {
    const res = await $api.post('/auth/login', {
        email,
        password
    })
}

export const logoutApi = async () => {
    await $api.post('/auth/logout');
};