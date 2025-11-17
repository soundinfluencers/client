import type {RequestLoginUserModel} from "../../types/auth/auth.types.ts";
import $api from "../api.ts";

export const login = async ({email, password}: RequestLoginUserModel) => {
    const res = await $api.post('/auth/login', {
        email,
        password
    })

    console.log(res, 'res')
}