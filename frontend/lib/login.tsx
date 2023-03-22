import api from "../pages/api/axios";
import {Login} from "@/types.d";
import {AxiosResponse} from "axios";

export const login = (email: string, password: string): Promise<AxiosResponse<any, any>> => {
    const host: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_LOGIN}`;
    const login_data: Login = {
        email: email,
        password: password,
    };

    // Attempt to login with axios so authentication tokens get saved in our axios instance
    return api.post(host, login_data, {
        headers: {"Content-Type": "application/json"},
    });
};

// function to automatically log in if a refresh token is found
// (will request a new access token)
export const verifyToken = (): Promise<AxiosResponse<any, any>> => {
    const verify_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_USERS}`;

    return api.get(verify_url, {
        headers: {"Content-Type": "application/json"}
    });
};

export default login;