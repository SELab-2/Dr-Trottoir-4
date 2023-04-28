import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";

export interface ChangePasswordInterface{
    old_password: string;
    new_password1: string;
    new_password2: string;
}

export interface ResetPasswordInterface{
    new_password1: string;
    new_password2: string;
    uid: string;
    token: string;
}

export async function verifyToken() {
    const post_url : string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_VERIFY_TOKEN}`;
    return await api.post(post_url);
}

export async function changePassword(passwordInterface: ChangePasswordInterface): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_CHANGE_PASSWORD}`;
    return await api.post(request_url, JSON.stringify(passwordInterface),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}

export async function resetPassword(passwordInterface: ResetPasswordInterface): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_RESET_PASSWORD_CONFIRM}/${passwordInterface.uid}/${passwordInterface.token}`;
    return await api.post(request_url, JSON.stringify(passwordInterface),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}