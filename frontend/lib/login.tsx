import api from "./api/axios";
import {Login} from "@/types.d";
import {AxiosResponse} from "axios";

export const login = (email: string, password: string): Promise<AxiosResponse<any, any>> => {
    const host: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_LOGIN}`;
    const login_data: Login = {
        email: email,
        password: password,
    };

    // Attempt to login with axios so authentication tokens get saved in our axios instance
    return api.post(host, JSON.stringify(login_data), {
        headers: {"Content-Type": "application/json"},
    });
};

/**
 * Check if the refresh token is valid
 */
export const verifyToken = (): Promise<AxiosResponse<any, any>> => {
    const verify_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_VERIFY_TOKEN}`;
    return api.get(verify_url);
};

export default login;
