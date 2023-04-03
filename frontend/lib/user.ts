import { AxiosResponse } from "axios";
import api from "@/lib/api/axios";
import * as process from "process";

export interface User {
    id : number,
    is_active : boolean,
    email : string,
    first_name : string,
    last_name : string,
    phone_number : string,
    region : number[],
    role : number
}

export const getCurrentUser = (): Promise<AxiosResponse<any, any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_USER}`;
    return api.get(request_url);
};
export const getUserInfo = (user_id: string): Promise<AxiosResponse<any, any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_USER}${user_id}`;
    return api.get(request_url);
};

export const getUserRole = (role_id: string): string => {
    // since only admins and superstudents can request the api for their role information,
    // we have to use a map so `everyone` can access its role name.

    const userDict = new Map<number, string>([
        [1, "Default"],
        [2, "Admin"],
        [3, "Superstudent"],
        [4, "Student"],
        [5, "Syndic"],
    ]);

    return userDict.get(parseInt(role_id)) || "Default";
};

export async function getAllUsers() : Promise<AxiosResponse<any, any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_USERS}`;
    return await api.get(request_url);
}
