import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";

export const getUserInfo = (user_id: string): Promise<AxiosResponse<any, any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_USER}${user_id}`;
    return api.get(request_url);
}

export const getUserRole = (role_id: string): Promise<AxiosResponse<any,any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ROLE}${role_id}`;

    return api.get(request_url);
}

export default getUserInfo;