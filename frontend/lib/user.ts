import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";
import * as process from "process";

export interface User {
    id: number,
    is_active: boolean,
    email: string,
    first_name: string,
    last_name: string,
    phone_number: string,
    region: number[],
    role: number
}

export function extractEmailFromString(text: string): string | null {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : null;
}

export function userSearchString(user: User) {
    return `${user.first_name} ${user.last_name} (${user.email})`
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


export async function getAllUsers(includeInactiveUser: boolean = false): Promise<AxiosResponse<any, any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_USERS}`;
    return await api.get(request_url, {
        params: {
            "include-inactive-bool": includeInactiveUser
        }
    });
}

export async function getSyndics() {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_USERS}`;
    return await api.get(request_url, {
        params: {
            "include-role-name-list": "syndic"
        }
    });
}

export async function deleteUser(userId: number): Promise<AxiosResponse<any, any>> {
    const delete_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_USER}${userId}`;
    return await api.delete(delete_url);
}

export async function patchUser(userId: number, data: Object): Promise<AxiosResponse<any, any>> {
    const patchUrl: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_USER}${userId}`;
    return await api.patch(patchUrl, JSON.stringify(data), {
        headers: {"Content-Type": "application/json"},
    });
}
