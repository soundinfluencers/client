import axios, {AxiosError} from 'axios';
import {handleApiError} from "./error.api.ts";

const $api = axios.create({
    baseURL: import.meta.env.VITE_SERVER,
    headers: {
        'Content-Type': 'application/json',
    },
});

$api.interceptors.response.use(
    // @ts-ignore
    (response) => response,
    (error: AxiosError) => {
        handleApiError(error);
        return Promise.reject(error);
    }
);

export default $api;